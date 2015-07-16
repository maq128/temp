/*

【题目】

一个大人带着 5 个年龄各异的孩子要过河，只有一条小船，只有大人能划船，每次摆渡时船上最多
可以带两个小孩。难点在于，任何两个年龄相邻的孩子在没有大人在场的情况下会打架；而且最终
都到达对岸之后，如果哪个小孩坐船的次数比别的小孩少的话就会生气。
请问：大人最少要摆渡多少次，才能把5个孩子都带到对岸，而且不会发生打架、生气的事情？

【数学模型】

用 0 表示“在此岸”，用 1 表示“在对岸”，则 6 个人（1 个大人和 5 个孩子）所有状态可以用
一个 6 位二进制数表示，如下：

    +---++---+---+---+---+---+
    | 6 || 5 | 4 | 3 | 2 | 1 |
    +---++---+---+---+---+---+
    |   || C5| C4| C3| C2| C1|
    | A ++---+---+---+---+---+
    |   ||         C         |
    +---++-------------------+

显然，总共有 64 种可能的组合（对应的状态值为 0-63）。然而，这些状态并不都是有效的，根据
题目要求，只有满足一定条件的状态才是有效的：

    1. A 为 0 时，C 区的 5 位不能有相邻的 1。
       即：大人在此岸时，对岸不能有两个小孩的年龄是相邻的。

    2. A 为 1 时，C 区的 5 位不能有相邻的 0。
       即：大人在对岸时，此岸不能有两个小孩的年龄是相邻的。

比如，起点状态是 000000（0），终点状态是 111111（63），而 100011（35）是无效状态。

以所有的“有效状态”作为节点，那么从任何一个节点向另外所有节点都可以画一条有方向的路线，
但并不是所有的路线都是“通路”，通路应该符合一定的条件。设两个节点的状态值分别为 s1 和
s2，那么：

    1. s1 跟 s2 的 A 位不能相同。
       即：只有大人能划船，每次都是大人从此岸到对岸，或者从对岸到此岸。

    2. A 为从 0 变成 1 时，C 区的 5 位只能从 0 变成 1，而且有这种变化的位数不能超过 2。
       即：小孩只能跟随大人坐船过河，而且每次最多两个小孩。

    3. A 为从 1 变成 0 时，C 区的 5 位只能从 1 变成 0，而且有这种变化的位数不能超过 2。
       理由同上一条。

由所有的“有效节点”和所有的“通路”组成了一个有向连通图。解题过程就是在这个连通图里从指定
的节点出发，找到最短路径到达另一个指定节点，且在整个行进过程中 C 区的 5 位 0/1 交替变化的
次数相同。

【数据结构和算法】

用一个数组变量 nodes 来保存整个连通图，数组的每个元素是一个有效节点，保存了该节点的状态
值（status）和通路列表（routes）。每个有效节点在 nodes 数组中的下标即是该节点的“序号”，
而 routes 为一个数组，数组的每个元素即是具有通路的后续节点的序号。

path 保存了搜索过程中的路径。为了使用方便，没有采用数组类型，而采用了对象类型，但其属性名
的规则跟数组下标是一样的，是从 0 开始的顺序整数，代表路径上的每个步骤。

每个“步骤（step）”是一个对象，包含了“所在节点的序号（node）”和“下一步走的通路序号（route）”。

用一个指针变量（ptr）表示当前待处理的步骤序号，用 path[ptr] 可以找到这个待处理的步骤对象，
逐个试探该步骤所处节点的每个通路，行进到下一个步骤（ptr++）；如果无路可走则退回到上一个
步骤（ptr--），这样就可以遍历所有的路径。

遍历过程中要注意，在一个路径上，同一个节点可以多次经过，但选择的后续通路不能跟当前路径前面
经过该节点时选择的一样（否则将陷入死循环）。

遍历开始时，设定初始位置为起始节点；遍历过程中，每推进到一个新步骤则检查是否已经到达终点，
如是，则统计整个路径上 C 区 5 位的 0/1 交替变化次数。若都相同则此路径成功，退回上一步骤继续
遍历（寻找可能更短的路径），否则继续向后试探路径（可能再跑几个来回就把交替变化的次数凑齐了）。

每找到一个成功的路径，就把这个路径输出，同时记录下这个路径的步数（当前最优方案步数），在此后
的遍历过程中，只要步数达到这个“当前最优步数”，就放弃继续搜索，退回上一步。这是个优化措施。

整个遍历完成后，最后输出的那个路径方案就是最终的最优方案。
*/

// 统计 C 区 1 的个数
function countBits(s)
{
    var cnt = 0;
    for (var i=0; i < 5; i++) {
        if (s & 0b000001) cnt ++;
        s = s >> 1;
    }
    return cnt;
}

// 判定一个节点是否有效
function isValidNode(status)
{
    if (status & 0b100000) {
        // A 在对岸，C 区不能有相邻的 0
        var C = (status & 0b011111);
        if ((((C << 1) | C) & 0b011110) != 0b011110) return false;
        return true;
    }

    // A 在此岸，C 区不能有相邻的 1
    var C = (status & 0b011111);
    if ((((C << 1) & C) & 0b011110) != 0b000000) return false;
    return true;
}

// 判定从一个节点到另一个节点是否通路
function isValidRoute(s1, s2)
{
    // 开始时 A 在对岸，A 从 1 变为 0
    if ((s1 & 0b100000) == 0b100000 && (s2 & 0b100000) == 0b000000) {
        // C 区不能有从 0 变为 1 的情况
        if ((s1 ^ 0b011111) & s2 & 0b011111) return false;

        // C 区从 1 变为 0 的位不超过 2 个
        if (countBits(s1 & (s2 ^ 0b011111) & 0b011111) > 2) return false;

        return true;
    }
    
    // 开始时 A 在此岸，A 从 0 变为 1
    if ((s1 & 0b100000) == 0b000000 && (s2 & 0b100000) == 0b100000) {
        // C 区不能有从 1 变为 0 的情况
        if (s1 & (s2 ^ 0b011111) & 0b011111) return false;

        // C 区从 0 变为 1 的位不超过 2 个
        if (countBits((s1 ^ 0b011111) & s2 & 0b011111) > 2) return false;

        return true;
    }

    return false;
}

function run()
{
    // 有效节点列表
    var nodes = [];

    // 找到所有有效节点
    for (var s=0; s < 64; s++) {
        if (isValidNode(s)) {
            var visual = ('000000' + s.toString(2)).substr(-6);
            visual = visual.substr(0, 1) + '.' + visual.substr(1);
            nodes.push({
                id    : nodes.length,   // 节点序号
                status: s,              // 节点状态值
                visual: visual,         // 状态值的可视化形式
                routes: []              // 存在通路的后续节点序号列表
            });
        }
    }

    // 连接所有通路
    for (var i=0; i < nodes.length; i++) {
        for (var j=0; j < nodes.length; j++) {
            if (j == i) continue;
            if (isValidRoute(nodes[i].status, nodes[j].status)) {
                nodes[i].routes.push(j);
            }
        }
    }

    // 输出整个连通图
    console.log(JSON.stringify(nodes, null, 2));

    // 开始遍历所有路径
    var ptr = 0; // 待处理步骤指针，指向 path 中的一个元素，即为当前待处理步骤
    var path = {}; // 由每个元素按顺序构成前进的路径
    path[ptr] = { // 路径的起点为初始状态
        node: 0,    // 节点序号，为当前步骤所对应的有效节点
        route: -1   // 通路序号，当前节点会有多个后续通路，此值表示此步骤采用的通路
    };

    // 记录当前最优方案的步数（给定一个估计数，可排除明显过长的路径）
    var best = 20;

    main_loop:
    while (true) {
        // 取出当前待处理的步骤
        var step = path[ptr];
        if (!step) break; // 所有路径遍历完成后退出循环

        // 当前路径的步数已经超过目前的最优方案，放弃继续尝试，退回到上一步骤
        if (ptr >= best) {
            delete path[ptr];
            ptr --;
            continue main_loop;
        }

        // 是否到达终点
        if (nodes[step.node].status == 0b111111) {
            // 统计 C 区各位变动次数
            var counters = [0, 0, 0, 0, 0];
            for (var i=0; i < ptr; i++) {
                var change = nodes[path[i].node].status ^ nodes[path[i+1].node].status;
                for (var j=0; j < 5; j++) {
                    if (change & (1 << j)) counters[j] ++;
                }
            }

            // 检查 C 区各位变动次数是否相同
            for (var j=1; j < 5; j++) {
                if (counters[0] != counters[j]) {
                    // 如果发现不同，则清空 counters 作为标记
                    counters = null;
                    break;
                }
            }

            // 若路径成功
            if (counters) {
                // 记录当前最优方案的步数
                best = ptr;

                // 输出当前最优方案
                var solution = [ptr + ' steps, ' + counters[0] + ' times per child:'];
                for (var i=0; i <= ptr; i++) {
                    solution.push(nodes[path[i].node].visual);
                }
                console.log(solution.join('\r\n\t'));

                // 退回上一步骤继续遍历
                delete path[ptr];
                ptr --;
                continue main_loop;
            }
        }

        // 试探当前节点的下一个通路
        find_route_loop:
        while (true) {
            step.route ++;
            if (step.route >= nodes[step.node].routes.length) {
                // 本节点的所有通路已经试遍，退回到上一步骤
                delete path[ptr];
                ptr --;
                continue main_loop;
            }

            // 已经经过的节点不能再次采用相同的通路
            for (var i=0; i < ptr; i++) {
                if (path[i].node == step.node && path[i].route == step.route)
                    continue find_route_loop;
            }

            // 找到了一个可用的通路
            break;
        }

        // 根据找到的通路，查出对应的后续节点，进入下一步骤
        ptr ++;
        path[ptr] = {
            node: nodes[step.node].routes[step.route],
            route: -1
        };
    }

    console.log('finished.');
}

run();
