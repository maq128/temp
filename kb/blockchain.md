# 参考资料

	如何发布你自己的 ICO？
	https://mp.weixin.qq.com/s/xH6lRj2ZX_fSiRDTjlmPuw

	Truffle
	http://truffleframework.com

	Ganache
	http://truffleframework.com/ganache

	ETHEREUM PET SHOP
	http://truffleframework.com/tutorials/pet-shop

	web3 JavaScript library
	https://github.com/ethereum/web3.js/
	https://github.com/ethereum/wiki/wiki/JavaScript-API

	Solidity
	http://solidity.readthedocs.io/en/latest/index.html

	A Guide to Ropsten Testnet Setup
	https://medium.com/@crissimrobert/a-guide-to-ropsten-testnet-setup-f8952d615417

	Ethereum Wiki
	https://github.com/ethereum/go-ethereum/wiki

	Ethereum and Oracles
	https://blog.ethereum.org/2014/07/22/ethereum-and-oracles/

	Oracle系列一、二
	https://medium.com/taipei-ethereum-meetup/oracle%E7%B3%BB%E5%88%97%E4%B8%80-human-oracle-cb7ed8268030
	https://medium.com/taipei-ethereum-meetup/oracle%E7%B3%BB%E5%88%97%E4%BA%8C-my-oracle-d86ea6971431

	在 Ropsten 测试网络申请获得 Ether
	http://faucet.ropsten.be:3001/

	在 Etherscan 查看账户信息
	https://ropsten.etherscan.io/address/0x640243b03ea3bd384b30823f91460735ba1ccd49
	https://ropsten.etherscan.io/address/0x04bf942d727c9729df4490fd9e9da0cdb49e84b5

	EOS.IO 技术白皮书
	https://github.com/EOSIO/Documentation/blob/master/zh-CN/TechnicalWhitePaper.md

	10分钟完成阿里云环境搭建以太坊私有链
	https://zhuanlan.zhihu.com/p/32911405

	获取 block hash 作为随机数
	https://github.com/fivedogit/solidity-baby-steps/blob/master/contracts/35_coin_flipper.sol


# Linux 上构建 geth

	Centos 6.5升级Git版本到Git2.7.2
	https://www.jianshu.com/p/371fe20db80c

	yum install go

	git clone https://github.com/ethereum/go-ethereum.git
	cd go-ethereum
	git checkout tags/v1.8.1
	make geth
	mv build /mnt/bin/geth


# Ropsten testnet

	https://github.com/ethereum/ropsten
	
	/mnt/bin/geth/bin/geth --testnet removedb
	/mnt/bin/geth/bin/geth --testnet --cache 512

	/mnt/bin/geth/bin/geth --testnet attach
	> eth.syncing
	> eth.blockNumber
	> eth.getBlock('latest').number
	> admin.nodeInfo
	> admin.peers
	> net.peerCount
	> net.listening

	du --max-depth=1 -h ~/.ethereum/
	df -ah


# 博彩应用

	peerplays
	https://www.peerplays.com/

	Peerplays：区块链将如何运用于博彩行业？May 09, 2017, 06:37:53 AM
	https://bitcointalk.org/index.php?topic=1908400.0

	Peerplays：区块链博彩如何成为现实？April 21, 2017, 03:46:11 AM
	https://bitcointalk.org/index.php?topic=1879657.0

	ultraplay
	http://ultraplay.co/

	HeroChain
	https://www.feixiaohao.com/coindetails/herochain/
