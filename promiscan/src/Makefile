CC = g++
CFLAGS = -Wall
INCLS = -I. -I${PWD}/../libpcap-1.6.2/include -I${PWD}/../libnet-1.2-rc3/include
LIBS = -L${PWD}/../libpcap-1.6.2/lib -L${PWD}/../libnet-1.2-rc3/lib
LDFLAGS = -Wl,-Bstatic,-lpcap,-lnet,-Bdynamic
HEADERS = promiscan.h
SOURCES = main.cpp utils.cpp

release: ${HEADERS} ${SOURCES}
	${CC} ${CFLAG} ${INCLS} ${LIBS} -o promiscan ${SOURCES} ${LDFLAGS}

debug: ${HEADERS} ${SOURCES}
	${CC} -g ${CFLAG} ${INCLS} ${LIBS} -o promiscan ${SOURCES} ${LDFLAGS}

all: debug release

clean:  
	rm -rf promiscan
