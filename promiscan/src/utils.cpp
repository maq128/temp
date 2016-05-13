#include "promiscan.h"

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

bool getLocalMac(const char *intf, uint8_t *mac)
{
	int sockfd = socket(PF_INET, SOCK_STREAM, 0);
	struct ifreq struReq;
	memset(&struReq, 0, sizeof(struReq));
	strncpy(struReq.ifr_name, intf, sizeof(struReq.ifr_name));

	int r = ioctl(sockfd, SIOCGIFHWADDR, &struReq);
	close(sockfd);
	if (r == 0) {
		for (int i=0; i < IFHWADDRLEN; i++) {
			mac[i] = struReq.ifr_hwaddr.sa_data[i];
		}
		return true;
	}
	return false;
}

map<uint32_t, string> enumInterfaces()
{
	map<uint32_t, string> ips;
	char errBuf[PCAP_ERRBUF_SIZE];
	pcap_if_t *intfs;
	int r = pcap_findalldevs(&intfs, errBuf);
	if (r) {
		dbg_printf("pcap_findalldevs: %s\n", errBuf);
		return ips;
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
					ips.insert(pair<uint32_t, string>(addr_in->sin_addr.s_addr, intf->name));
				}
				addr = addr->next;
			}
		}
		intf = intf->next;
	}
	pcap_freealldevs(intfs);
	return ips;
}
