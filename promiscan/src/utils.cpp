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

void dumpHeaders(const struct pcap_pkthdr *pkthdr, const u_char *packet)
{
	dbg_printf("caplen: %d\n", pkthdr->caplen);
	dbg_printf("len   : %d\n", pkthdr->len);

	int i;

	struct ethhdr *pEthHdr = (struct ethhdr *)packet;
	int len1 = sizeof(struct ethhdr);
	dbg_printf("EtherHeader (%d) --\n", len1);

	dbg_printf("  dst MAC:");
	for (i=0; i < ETH_ALEN; i++) {
		dbg_printf(" %02X", pEthHdr->h_dest[i]);
	}
	dbg_printf("\n");

	dbg_printf("  src MAC:");
	for (i=0; i < ETH_ALEN; i++) {
		dbg_printf(" %02X", pEthHdr->h_source[i]);
	}
	dbg_printf("\n");

	uint16_t proto = ntohs(pEthHdr->h_proto);
	dbg_printf("  proto  : %04X\n", proto);

	if (proto != ETH_P_IP && proto != ETH_P_8021Q) return;
	if (proto == ETH_P_8021Q) {
		len1 += 4;
	}
	////////////////

	struct iphdr *pIpHdr = (struct iphdr *)(packet + len1);
	int len2 = pIpHdr->ihl * 4;
	dbg_printf("IpHeader (%d) --\n", len2);

	dbg_printf("  ihl     : %01X\n", pIpHdr->ihl);
	dbg_printf("  version : %01X\n", pIpHdr->version);
	dbg_printf("  tos     : %02X\n", pIpHdr->tos);
	dbg_printf("  tot_len : %04X - %d\n", ntohs(pIpHdr->tot_len), ntohs(pIpHdr->tot_len));
	dbg_printf("  id      : %04X - %d\n", ntohs(pIpHdr->id), ntohs(pIpHdr->id));
	dbg_printf("  frag_off: %04X - %d\n", ntohs(pIpHdr->frag_off), ntohs(pIpHdr->frag_off));
	dbg_printf("  ttl     : %02X - %d\n", pIpHdr->ttl, pIpHdr->ttl);
	dbg_printf("  protocol: %02X\n", pIpHdr->protocol);
	dbg_printf("  check   : %04X\n", ntohs(pIpHdr->check));
	struct in_addr ip_addr;
	ip_addr.s_addr = pIpHdr->saddr;
	dbg_printf("  saddr   : %08X - %s\n", ntohl(pIpHdr->saddr), inet_ntoa(ip_addr));
	ip_addr.s_addr = pIpHdr->daddr;
	dbg_printf("  daddr   : %08X - %s\n", ntohl(pIpHdr->daddr), inet_ntoa(ip_addr));

	uint32_t checksum = 0;
	for (i=0; i < len2; i += sizeof(uint16_t)) {
		uint16_t word = *((uint16_t *)(packet + len1 + i));
		checksum += ntohs(word);
	}
	dbg_printf("  checksum-%08X\n", checksum);
	checksum = (checksum >> 16) + (checksum & 0xffff);
	dbg_printf("  checksum-%08X\n", checksum);

	////////////////

	if (pIpHdr->protocol == SOL_TCP) {
		struct tcphdr *pTcpHdr = (struct tcphdr *)(packet + len1 + len2);
		int len3 = pTcpHdr->doff * 4;
		dbg_printf("TcpHeader (%d/%d) --\n", len3, pkthdr->caplen - len1 - len2);

		dbg_printf("  source : %04X - %d\n", ntohs(pTcpHdr->source), ntohs(pTcpHdr->source));
		dbg_printf("  dest   : %04X - %d\n", ntohs(pTcpHdr->dest), ntohs(pTcpHdr->dest));
		dbg_printf("  seq    : %08X - %d\n", ntohl(pTcpHdr->seq), ntohl(pTcpHdr->seq));
		dbg_printf("  ack_seq: %08X - %d\n", ntohl(pTcpHdr->ack_seq), ntohl(pTcpHdr->ack_seq));

		dbg_printf("  res1   : %01X\n", pTcpHdr->res1);
		dbg_printf("  doff   : %01X\n", pTcpHdr->doff);
		dbg_printf("  fin    : %01X\n", pTcpHdr->fin);
		dbg_printf("  syn    : %01X\n", pTcpHdr->syn);
		dbg_printf("  rst    : %01X\n", pTcpHdr->rst);
		dbg_printf("  psh    : %01X\n", pTcpHdr->psh);
		dbg_printf("  ack    : %01X\n", pTcpHdr->ack);
		dbg_printf("  urg    : %01X\n", pTcpHdr->urg);
		dbg_printf("  res2   : %01X\n", pTcpHdr->res2);

		dbg_printf("  window : %04X - %d\n", ntohs(pTcpHdr->window), ntohs(pTcpHdr->window));
		dbg_printf("  check  : %04X\n", ntohs(pTcpHdr->check));
		dbg_printf("  urg_ptr: %04X\n", ntohs(pTcpHdr->urg_ptr));

		uint32_t src_addr = ntohl(pIpHdr->saddr);
		uint32_t dst_addr = ntohl(pIpHdr->daddr);
		uint16_t tcp_len = ntohs(pIpHdr->tot_len) - len2;
		checksum = 0;
		checksum += src_addr >> 16;
		dbg_printf("[%04X] - [%08X]\n", src_addr >> 16, checksum);
		checksum += src_addr & 0xffff;
		dbg_printf("[%04X] - [%08X]\n", src_addr & 0xffff, checksum);
		checksum += dst_addr >> 16;
		dbg_printf("[%04X] - [%08X]\n", dst_addr >> 16, checksum);
		checksum += dst_addr & 0xffff;
		dbg_printf("[%04X] - [%08X]\n", dst_addr & 0xffff, checksum);
		checksum += 0x0006;
		dbg_printf("[%04X] - [%08X]\n", 0x0006, checksum);
		checksum += tcp_len;
		dbg_printf("[%04X] - [%08X]\n", tcp_len, checksum);
		for (i=0; i < tcp_len; i += sizeof(uint16_t)) {
			if (i + sizeof(uint16_t) > tcp_len) {
				// the last single byte
				uint16_t word = *(packet + len1 + len2 + i);
				checksum += ntohs(word);
//				dbg_printf("[%04X] - [%08X]\n", ntohs(word), checksum);
			} else {
				uint16_t word = *((uint16_t *)(packet + len1 + len2 + i));
				checksum += ntohs(word);
//				dbg_printf("[%04X] - [%08X]\n", ntohs(word), checksum);
			}
		}
		dbg_printf("  checksum-%08X\n", checksum);
		checksum = (checksum >> 16) + (checksum & 0xffff);
		dbg_printf("  checksum-%08X\n", checksum);

	} else if (pIpHdr->protocol == SOL_UDP) {
		// ...
	}
}
