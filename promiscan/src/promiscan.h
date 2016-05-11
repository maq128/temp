#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sched.h>
#include <pthread.h>
#include <poll.h>
#include <sys/sysinfo.h>
#include <getopt.h>
#include <sys/file.h>
#include <locale.h>

#include <string>
#include <algorithm>
#include <iterator>
#include <vector>
#include <map>
#include <fstream>
#include <sstream>
using namespace std;

#include <linux/if_ether.h>
#include <linux/ip.h>
#include <netinet/tcp.h>
#include <netinet/udp.h>
#include <arpa/inet.h>

#include <pcap/pcap.h>
#include <libnet.h>

#define _DBG_LOG true

#if _DBG_LOG
	#define dbg_printf(args...) printf(args)
#else
	#define dbg_printf(args...)
#endif

// implements in utils.cpp
void dumpHex(const u_char *packet, int len);
void dumpHeaders(const struct pcap_pkthdr *pkthdr, const u_char *packet);
