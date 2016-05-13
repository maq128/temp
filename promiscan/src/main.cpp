#include "promiscan.h"

pcap_t *pc;
libnet_t *pLibnetCtx;
string my_intf;
u_int8_t my_mac[6] = {0x08, 0x00, 0x27, 0x3b, 0x8a, 0x2a};
u_int8_t my_ip[4] = {0x00, 0x00, 0x00, 0x00};
int num = 0;
map<string, string> all_found;

bool initInterface()
{
	char errBuf[PCAP_ERRBUF_SIZE];
	pc = pcap_create(my_intf.c_str(), errBuf);
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
			"ether proto 0x0806 and arp[6:2]==2",
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
			LIBNET_LINK,	/* injection type */
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
//	dumpHex(packet, pkthdr->caplen);
//	dumpHeaders(pkthdr, packet);
	if (pkthdr->caplen < 42) return;
	for (int i=0; i < 6; i++) {
		if (my_mac[i] != packet[32 + i]) return;
	}
	for (int i=0; i < 4; i++) {
		if (my_ip[i] != packet[38 + i]) return;
	}

	char str_mac[20];
	char str_ip[20];
	sprintf(str_mac, "%02X-%02X-%02X-%02X-%02X-%02X", packet[22], packet[23], packet[24], packet[25], packet[26], packet[27]);
	sprintf(str_ip, "%d.%d.%d.%d", packet[28], packet[29], packet[30], packet[31]);
	all_found.insert(pair<string, string>(str_ip, str_mac));
	printf("promiscuous: MAC(%s) IP(%s)\n", str_mac, str_ip);
}

bool inject_packet()
{
	num ++;

	if (num < 255 && num != my_ip[3]) {
		printf("check: %d.%d.%d.%d\n", my_ip[0], my_ip[1], my_ip[2], num);

//		0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
//		0x08, 0x00, 0x27, 0x3b, 0x8a, 0x2a,
//		0x08, 0x06,
//		0x00, 0x01,
//		0x08, 0x00,
//		0x06,
//		0x04,
//		0x00, 0x01,
//		0x08, 0x00, 0x27, 0x3b, 0x8a, 0x2a,
//		0xc0, 0xa8, 0x96, 0x2d,
//		0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
//		0xc0, 0xa8, 0x96, 0x20

		u_int8_t tha[6] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
		u_int8_t tpa[4];
		tpa[0] = my_ip[0];
		tpa[1] = my_ip[1];
		tpa[2] = my_ip[2];
		tpa[3] = num;
		libnet_ptag_t arp_tag = libnet_build_arp(
			0x0001,					// u_int16_t 		hrd,
			0x0800,					// u_int16_t 		pro,
			6,						// u_int8_t 		hln,
			4,						// u_int8_t 		pln,
			1,						// u_int16_t 		op,
			my_mac,					// u_int8_t *	 	sha,
			my_ip,					// u_int8_t *	 	spa,
			tha,					// u_int8_t *	 	tha,
			tpa,					// u_int8_t *	 	tpa,
			NULL,					// u_int8_t *	 	payload,
			0,						// u_int32_t 		payload_s,
			pLibnetCtx,				// libnet_t *	 	l,
			LIBNET_PTAG_INITIALIZER	// libnet_ptag_t 	ptag
		);

		if (arp_tag == -1) {
			dbg_printf("libnet_build_arp() error: %s\n", libnet_geterror(pLibnetCtx));
		} else {
			u_int8_t dst[6] = {0xff, 0xff, 0xff, 0xff, 0xff, 0xfe};
			libnet_ptag_t ether_tag = libnet_build_ethernet(
				dst,					// u_int8_t * 		dst,
				my_mac,					// u_int8_t * 		src,
				0x0806,					// u_int16_t 		type,
				NULL,					// u_int8_t * 		payload,
				0,						// u_int32_t 		payload_s,
				pLibnetCtx,				// libnet_t * 		l,
				LIBNET_PTAG_INITIALIZER	// libnet_ptag_t 	ptag
			);

			if (arp_tag == -1) {
				dbg_printf("libnet_build_ethernet() error: %s\n", libnet_geterror(pLibnetCtx));
			} else {
				int c;
				c = libnet_write(pLibnetCtx);
				if (c == -1) {
					dbg_printf("libnet_write() error: %s\n", libnet_geterror(pLibnetCtx));
				}
			}
		}

		libnet_clear_packet(pLibnetCtx);
	} else {
		printf("idle: %d\n", num);
	}

	if (num >= 260) return false;
	return true;
}

int scan()
{
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

	printf("found %d nodes in promiscuous mode:\n", all_found.size());
	for (map<string, string>::iterator it = all_found.begin(); it != all_found.end(); it ++) {
		pair<string, string> found = *it;
		printf("  %s  %s\n", found.second.c_str(), found.first.c_str());
	}

	return EXIT_SUCCESS;
}

int main(int argc, char **argv)
{
	static const char * const helptext[] = {
		"promiscan - " __DATE__ " T " __TIME__ ", compiled by gcc " __VERSION__,
		"Usage:",
		"    promiscan [options...]",
		"Options:",
		"    -i, --intf intf    Interface name of the NIC",
		"    -l, --list         List all available network interfaces",
		"    -h, --help         This help text",
		NULL
	};

	static struct option long_options[] = {
		{"intf",	required_argument,	0,	'i'},
		{"list",	no_argument,		0,	'l'},
		{"help",	no_argument,		0,	'h'},
		{0, 0, 0, 0}
	};

	bool arg_list = false;
	bool arg_help = false;
	int option_index = 0;
	bool abort = false;
	int c;
	while (!abort && (c = getopt_long(argc, argv, "i:lh", long_options, &option_index)) != -1) {
		switch (c) {
		case 'i':
			my_intf = optarg;
			break;
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

	// 遍历所有可用的 interfaces
	map<uint32_t, string> ips = enumInterfaces();
	if (arg_list) {
		for (map<uint32_t, string>::iterator it = ips.begin(); it != ips.end(); it ++) {
			pair<uint32_t, string> ip = *it;
			struct in_addr in;
			in.s_addr = ip.first;
			printf("%s (%s)%s\n", ip.second.c_str(), inet_ntoa(in), (it == ips.begin() ? "*" : ""));
		}
		return EXIT_SUCCESS;
	}

	if (my_intf.size() == 0) {
		// 如果没有指定 interface，则使用第一个找到的
		for (map<uint32_t, string>::iterator it = ips.begin(); it != ips.end(); it ++) {
			pair<uint32_t, string> ip = *it;
			my_intf = ip.second;
			*((uint32_t *)my_ip) = ip.first;
			break;
		}
	} else {
		// 如果指定了 interface，则使用第一个对应的 IP
		for (map<uint32_t, string>::iterator it = ips.begin(); it != ips.end(); it ++) {
			pair<uint32_t, string> ip = *it;
			if (my_intf == ip.second) {
				*((uint32_t *)my_ip) = ip.first;
				break;
			}
		}
	}

	if (my_ip[0] == 0) {
		printf("No available interface found.\n");
		return EXIT_FAILURE;
	}

	if (!getLocalMac(my_intf.c_str(), my_mac)) {
		dbg_printf("Cannot get local MAC.\n");
		return EXIT_FAILURE;
	}

	if (initInterface()) {
		printf("Cannot initialize interface '%s'.\n", my_intf.c_str());
		return EXIT_FAILURE;
	}

	printf("Scanning promiscuous nodes through interface %s (%d.%d.%d.%d) ...\n",
		my_intf.c_str(),
		my_ip[0], my_ip[1], my_ip[2], my_ip[3]
	);
	int r = scan();

	releaseInterface();

	return r;
}
