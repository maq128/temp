#include "qqip.h"

void dumpHex(const u_char *mem, int len)
{
	int i;
	char buf[20];
	memset(buf, 0, sizeof(buf));
	for (i = 0; i < len; ++i) {
		dbg_printf(" %02x", mem[i]);
		if (isprint(mem[i])) {
			buf[i%16] = mem[i];
		} else {
			buf[i%16] = '.';
		}
		if ((i + 1) % 16 == 0) {
			dbg_printf(" %s\n", buf);
			memset(buf, 0, sizeof(buf));
		}
	}
	for (; (i%16) != 0; ++i) {
		dbg_printf("   ");
	}
	dbg_printf(" %s\n", buf);
}

multimap<string, uint32_t> enumInterfaces()
{
	multimap<string, uint32_t> names;
	char errBuf[PCAP_ERRBUF_SIZE];
	pcap_if_t *intfs;
	int r = pcap_findalldevs(&intfs, errBuf);
	if (r) {
		dbg_printf("pcap_findalldevs: %s\n", errBuf);
		return names;
	}
	pcap_if_t *intf = intfs;
	while (intf) {
		if ((intf->flags & PCAP_IF_LOOPBACK) == 0 &&
			(intf->flags & PCAP_IF_UP) == PCAP_IF_UP &&
			(intf->flags & PCAP_IF_RUNNING) == PCAP_IF_RUNNING &&
			strcmp(intf->name, "any") != 0)
		{
			pcap_addr_t *addr = intf->addresses;
			while (addr) {
				if (addr->addr->sa_family == AF_INET) {
					sockaddr_in *addr_in = (sockaddr_in *)addr->addr;
					char buf[INET_ADDRSTRLEN];
					inet_ntop(AF_INET, &(addr_in->sin_addr), buf, sizeof(buf));
					names.insert(pair<string, uint32_t>(intf->name, addr_in->sin_addr.s_addr));
				} else {
					names.insert(pair<string, uint32_t>(intf->name, 0));
				}
				addr = addr->next;
			}
		}
		intf = intf->next;
	}
	pcap_freealldevs(intfs);
	return names;
}
