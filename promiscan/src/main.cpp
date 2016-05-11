#include "promiscan.h"

typedef bool (loop_callback)();

pcap_t *pc;
libnet_t *pLibnetCtx;

bool initInterface(const char *intf)
{
	char errBuf[PCAP_ERRBUF_SIZE];
	pc = pcap_create(intf, errBuf);
	if (!pc) {
		dbg_printf("pcap_create failed: %s\n", errBuf);
		return true;
	}

	int r = pcap_set_promisc(pc, 1);
	if (r) {
		dbg_printf("pcap_set_promisc: %08X\n", r);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	r = pcap_set_snaplen(pc, 65535);
	if (r) {
		dbg_printf("pcap_set_snaplen: %08X\n", r);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	r = pcap_set_timeout(pc, 500);
	if (r) {
		dbg_printf("pcap_set_timeout: %d\n", r);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	r = pcap_activate(pc);
	if (r) {
		dbg_printf("pcap_activate: %s\n", pcap_geterr(pc));
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	struct bpf_program bpf;
	r = pcap_compile(pc, &bpf,
			"("
				// 目标端口是 80
				"(tcp dst port 80)"
				" and "
				// tcp payload 长度大于 0
				"(((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)"
				" and "
				// tcp payload 的前 4 个字节为 "GET "
				"(tcp[((tcp[12]&0xf0)>>2):4] == 0x47455420)"
			") or ("
				// radius acct
				"(udp src port 1813)"
				" and "
				// sa-msg-port
				"(udp dst port 1646)"
				" and "
				// Accounting-Request
				"(udp[8] == 0x04)"
			")",
			1, PCAP_NETMASK_UNKNOWN);

	if (r) {
		dbg_printf("pcap_compile: %08X\n", r);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	r = pcap_setfilter(pc, &bpf);
	if (r) {
		dbg_printf("pcap_setfilter: %08X\n", r);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	char errbuf[LIBNET_ERRBUF_SIZE];
	pLibnetCtx = libnet_init(
			LIBNET_RAW4,	/* injection type */
			NULL,			/* network interface */
			errbuf);		/* errbuf */
	if (pLibnetCtx == NULL) {
		dbg_printf("libnet_init() failed: %s\n", errbuf);
		pcap_close(pc);
		pc = NULL;
		return true;
	}

	return false;
}

void releaseInterface()
{
	if (pc) {
		pcap_close(pc);
	}
	if (pLibnetCtx) {
		libnet_destroy(pLibnetCtx);
	}
}

void procPacket(u_char *userarg, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
	dumpHex(packet, pkthdr->caplen);
	dumpHeaders(pkthdr, packet);
}

int num = 2;

bool inject_packet()
{
	if (num >= 10) return false;
	num ++;
	dbg_printf("inject_packet %d\n", num);
	return true;

//	int MTU = 1500;
//	int max_packet_size = (MTU - LIBNET_IPV4_H - LIBNET_TCP_H);
//		max_packet_size -= (max_packet_size % 8);
//
//	libnet_ptag_t ip_tag = LIBNET_PTAG_INITIALIZER;
//
//	int packet_size = 1; // ?
//
//	ip_tag = libnet_build_ipv4(
//			LIBNET_IPV4_H + LIBNET_TCP_H + packet_size,	/* length */
//			0,											/* TOS */
//			242,										/* IP ID */
//			0,											/* IP Frag */
//			123,										/* TTL */
//			IPPROTO_TCP,								/* protocol */
//			0,											/* checksum */
//			htonl(dst_ip),						/* source IP */
//			htonl(src_ip),						/* destination IP */
//			NULL,										/* payload */
//			0,											/* payload size */
//			pLibnetCtx,									/* libnet handle */
//			ip_tag);									/* libnet id */
//	if (ip_tag == -1) {
//		dbg_printf("Can't build IP header: %s\n", libnet_geterror(pLibnetCtx));
//		goto bad;
//	}
//
//	int c;
//	c = libnet_write(pLibnetCtx);
//	if (c == -1) {
//		dbg_printf("Write error: %s\n", libnet_geterror(pLibnetCtx));
//		goto bad;
//	}
//
//bad:
//	libnet_clear_packet(pLibnetCtx);
//	return true;
}

int capture_start(const char *intf)
{
	bool err = initInterface(intf);
	if (err) {
		return EXIT_FAILURE;
	}

	struct pollfd pollinfo;
	pollinfo.fd = pcap_get_selectable_fd(pc);
	pollinfo.events = POLLIN;

	while (inject_packet()) {
		int r = poll(&pollinfo, 1, 500);
		if (r < 0) {
			// 如果是被 SIGINT/SIGUSR1 打断，则继续工作
			if (errno == EINTR) continue;

			dbg_printf("poll: %08X\n", r);
			return EXIT_FAILURE;
		}
		if (r == 0) continue;

		if ((pollinfo.revents & POLLIN) != 0) {
			r = pcap_dispatch(pc, 100, procPacket, (u_char *)0);
			if (r == -1) {
				return EXIT_FAILURE;
			}
			pollinfo.revents = 0;
		}
	}

	releaseInterface();
	return EXIT_SUCCESS;
}

void listInterfaces()
{
	char errBuf[PCAP_ERRBUF_SIZE];
	pcap_if_t *intfs;
	int r = pcap_findalldevs(&intfs, errBuf);
	if (r) {
		dbg_printf("pcap_findalldevs: %s\n", errBuf);
		return;
	}
	pcap_if_t *intf = intfs;
	while (intf) {
		if ((intf->flags & PCAP_IF_LOOPBACK) == 0 &&
			(intf->flags & PCAP_IF_UP) == PCAP_IF_UP &&
			(intf->flags & PCAP_IF_RUNNING) == PCAP_IF_RUNNING &&
			strcmp(intf->name, "any") != 0) {

			printf("%s", intf->name);

			pcap_addr_t *addr = intf->addresses;
			while (addr) {
				if (addr->addr->sa_family == AF_INET) {
					sockaddr_in *addr_in = (sockaddr_in *)addr->addr;
					char buf[INET_ADDRSTRLEN];
					inet_ntop(AF_INET, &(addr_in->sin_addr), buf, sizeof(buf));
					printf(" (%s)", buf);
//				} else if (addr->addr->sa_family == AF_INET6) {
//					sockaddr_in6 *addr_in6 = (sockaddr_in6 *)addr->addr;
//					char buf[INET6_ADDRSTRLEN];
//					inet_ntop(AF_INET6, &(addr_in6->sin6_addr), buf, sizeof(buf));
//					printf(" (%s)", buf);
				}
				addr = addr->next;
			}
			printf("\n");
		}
		intf = intf->next;
	}
	pcap_freealldevs(intfs);
}

int main(int argc, char **argv)
{
	static const char * const helptext[] = {
		"promiscan - " __DATE__ " T " __TIME__ ", compiled by gcc " __VERSION__,
		"Usage:",
		"    promiscan [options...]",
		"Options:",
		"    -l, --list         List all available network interfaces",
		"    -h, --help         This help text",
		NULL
	};

	static struct option long_options[] = {
		{"list",	no_argument,		0,	'l'},
		{"help",	no_argument,		0,	'h'},
		{0, 0, 0, 0}
	};

	bool arg_list = false;
	bool arg_help = false;
	int option_index = 0;
	bool abort = false;
	int c;
	while (!abort && (c = getopt_long(argc, argv, "lh", long_options, &option_index)) != -1) {
		switch (c) {
		case 'l':
			arg_list = true;
			break;
		case 'h':
			arg_help = true;
			break;
		default:
			arg_help = true;
			abort = true;
		}
	}

	if (arg_help) {
		for (int i = 0; helptext[i]; i++)
			puts(helptext[i]);
		return EXIT_SUCCESS;
	}

	if (arg_list) {
		listInterfaces();
		return EXIT_SUCCESS;
	}

	int r = capture_start("eth0");

	return r;
}
