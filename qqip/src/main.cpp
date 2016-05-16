#include "qqip.h"
#include "kbhit.h"

pcap_t *pc;
string my_intf;
map<uint32_t, uint32_t> qqip;

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
			"udp src port 8000"		/* OICQ 的服务器端口 */
			" and udp[8]==0x02"		/* OICQ Protocol Flag */
			" and udp[12]==0x02",	/* OICQ Command: Heart Message */
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

	return false;
}

void printList()
{
	printf("QQ-IP list (%d):\n", qqip.size());
	for (map<uint32_t, uint32_t>::iterator it = qqip.begin(); it != qqip.end(); it ++) {
		pair<uint32_t, uint32_t> item = *it;
		struct in_addr in;
		in.s_addr = item.second;
		printf("  %u @ %s\n", item.first, inet_ntoa(in));
	}
	printf("\n");
}

void releaseInterface()
{
	if (pc) {
		pcap_close(pc);
	}
}

bool loop_check()
{
	if (!kbhit()) return true;
	int c = getch();
	if (c == 27) { // use ESC to stop the program
		if (kbhit()) { // ignore function keys
			while (kbhit()) c=getch();
		} else {
			// quit loop
			return false;
		}
	} else if (c == 112) { // 'p'
		printList();
	} else {
		printf("press ESC to quit, and press 'p' to print list.\n");
	}
	return true;
}

void procPacket(u_char *userarg, const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
//	dumpHex(packet, pkthdr->caplen);
	if (pkthdr->caplen < 0x35) return;

	uint32_t qq = ntohl(*(uint32_t *)(packet + 0x31));
	uint32_t ip = *(uint32_t *)(packet + 0x1e);

	int sz = qqip.size();
	qqip.insert(pair<uint32_t, uint32_t>(qq, ip));
	if (qqip.size() > sz) {
		printList();
	}
}

int listen()
{
	struct pollfd pollinfo;
	pollinfo.fd = pcap_get_selectable_fd(pc);
	pollinfo.events = POLLIN;

	init_keyboard();
	char_keyboard();
	while (loop_check()) {
		int r = poll(&pollinfo, 1, 200);
		if (r < 0) {
			/* 如果是被 SIGINT/SIGUSR1 打断，则继续工作 */
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
	original_keyboard();

	printList();

	return EXIT_SUCCESS;
}

int main(int argc, char **argv)
{
	static const char * const helptext[] = {
		"qqip - " __DATE__ " T " __TIME__ ", compiled by gcc " __VERSION__,
		"Usage:",
		"    qqip [options...]",
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

	/* 遍历所有可用的 interfaces */
	multimap<string, uint32_t> names = enumInterfaces();
	if (arg_list) {
		for (multimap<string, uint32_t>::iterator it = names.begin(); it != names.end(); it ++) {
			pair<string, uint32_t> name = *it;
			struct in_addr in;
			in.s_addr = name.second;
			printf("%s (%s)%s\n", name.first.c_str(), inet_ntoa(in), (it == names.begin() ? "*" : ""));
		}
		return EXIT_SUCCESS;
	}

	if (my_intf.size() == 0) {
		/* 如果没有指定 interface，则使用第一个找到的 */
		for (multimap<string, uint32_t>::iterator it = names.begin(); it != names.end(); it ++) {
			pair<string, uint32_t> ip = *it;
			my_intf = ip.first;
			break;
		}
	}

	if (my_intf.size() == 0) {
		printf("Interface required.\n");
		return EXIT_FAILURE;
	}

	if (initInterface()) {
		printf("Cannot initialize interface '%s'.\n", my_intf.c_str());
		return EXIT_FAILURE;
	}

	printf("Collecting QQ numbers through interface %s ...\n", my_intf.c_str());
	int r = listen();

	releaseInterface();

	return r;
}
