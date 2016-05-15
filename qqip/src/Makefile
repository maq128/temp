CC = g++
CFLAGS = -Wall
INCLS = -I. -I${PWD}/../libpcap-1.6.2/include
LIBS = -L${PWD}/../libpcap-1.6.2/lib
LDFLAGS = -Wl,-Bstatic,-lpcap,-Bdynamic
HEADERS = qqip.h kbhit.h
SOURCES = main.cpp kbhit.c utils.cpp

release: ${HEADERS} ${SOURCES}
	${CC} ${CFLAG} ${INCLS} ${LIBS} -o qqip ${SOURCES} ${LDFLAGS}

debug: ${HEADERS} ${SOURCES}
	${CC} -g ${CFLAG} ${INCLS} ${LIBS} -o qqip ${SOURCES} ${LDFLAGS}

all: debug release

clean:  
	rm -rf qqip
