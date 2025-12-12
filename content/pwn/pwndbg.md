---
title: "pwndbg调试指南"
excerpt: "因为所有题目几乎都不可能一次就打通，所以你需要学会如何调试并找到问题"
date: "2025-12-13"
slug: "pwndbg"
section: "pwn"
---

<div class="intro-article">

## pwndbg 基本操作与常用指令总结

ps:因为是我很久之前抄在word中的技术文章,所以可能排版有点奇怪😄

> 基础指令😊

<span style="color:red">help</span>：帮助命令

<span style="color:orange">i</span>：info，查看信息（输入 info 可查看所有子命令）

<span style="color:yellow">i b</span>：查看所有断点信息（编号、地址）

<span style="color:green">i r</span>：查看寄存器

<span style="color:cyan">i f</span>：查看函数名（需保留符号）

<span style="color:blue">show</span>：查看调试器自身信息

<span style="color:purple">show args</span>：查看程序参数

<span style="color:red">rdi</span>：直接打印寄存器值（如 $rdi）

<span style="color:orange">backtrace</span>：查看调用栈

<span style="color:yellow">q</span>：退出 gdb

<span style="color:green">vmmap</span>：查看内存布局

> 执行指令(好理解,但很关键,最好动手看看😊)

<span style="color:cyan">s</span>：源码层面的单步步入（step into）

<span style="color:blue">si</span>：汇编层面的单步步入

<span style="color:purple">n</span>：源码层面的步过（step over）

<span style="color:red">ni</span>：汇编层面的步过

<span style="color:orange">c</span>：继续执行直到断点

<span style="color:yellow">r</span>：重新运行

<span style="color:green">start</span>：运行到 main 起始处

> 断点操作(重要!)

> 下断点（break）

<span style="color:cyan">b *0x123456</span>：给某地址下断点(最常用)

<span style="color:blue">b *$rebase(0x123456)</span>：PIE 位置无关地址断点

<span style="color:purple">b fun_name</span>：给函数下断点

<span style="color:red">b file.c:15</span>：给某源码行下断点

<span style="color:orange">b +0x10</span>：当前停住位置偏移下断点

<span style="color:yellow">break fun if $rdi==5</span>：条件断点

> 删除、禁用断点

<span style="color:green">info break</span>：查看断点编号

<span style="color:cyan">delete 5</span>：删除 5 号断点

<span style="color:blue">disable 5</span>：禁用

<span style="color:purple">enable 5</span>：启用

<span style="color:red">clear</span>：清除当前文件所有断点

> 内存断点（watch）

<span style="color:orange">watch 0x123456</span>：该地址值改变时断

<span style="color:yellow">watch a</span>：变量改变时断

<span style="color:green">info watchpoints</span>：查看 watch 列表

> 捕获断点（catch）

<span style="color:cyan">catch syscall</span>：系统调用断住

<span style="color:blue">tcatch syscall</span>：只断一次

其他：throw / catch / exec / fork / vfork / load / unload / syscall 等

> 查看内存（x 指令）也很重要!

> 分析内存布局时必备哦~

格式：x /nfu addr

n：显示几个单元

u：每个单元大小（b/h/w/g）

f：显示格式（x/u/d/t/a/c/f/s/i）

示例：

<span style="color:purple">x /10gx 0x123456</span>：十个 8 字节单元

<span style="color:red">x /10xd $rdi</span>：打印 rdi 指向的十个 4B 数值

<span style="color:orange">x /10i 0x123456</span>：打印指令

> 打印指令（p）

<span style="color:yellow">p fun_name</span>：打印函数地址

<span style="color:green">p 0x10-0x08</span>：计算表达式

<span style="color:cyan">p &a</span>：查看变量地址

<span style="color:blue">p *(0x123456)</span>：查看地址值

<span style="color:purple">p $rdi</span>：打印寄存器

> 修改/查找指令

<span style="color:red">set $rdi=0x10</span>：改寄存器

<span style="color:orange">set *(0x123456)=0x10</span>：改内存

<span style="color:yellow">search rdi</span>：查指令

<span style="color:green">find "hello"</span>：找字符串（pwndbg 特有）

> 堆调试（pwndbg 独有）我也不会，先忽略😁😁

<span style="color:cyan">arena</span>：查看主 arena

<span style="color:blue">arenas</span>：所有 arena

<span style="color:purple">arenainfo</span>：更美观显示

<span style="color:red">bins</span>：最常用，查看所有 bins

<span style="color:orange">fastbins</span>

<span style="color:yellow">largebins</span>

<span style="color:green">smallbins</span>

<span style="color:cyan">unsortedbin</span>

<span style="color:blue">tcache</span>

<span style="color:purple">tcachebins</span>

<span style="color:red">heap</span>：显示所有堆块

<span style="color:orange">heapbase</span>：堆基址

<span style="color:yellow">parseheap</span>：更清晰的堆结构

<span style="color:green">tracemalloc</span>：跟踪堆操作

> 其他 pwndbg 常用指令

<span style="color:cyan">cyclic 50</span>：生成 50 字节的溢出模式(测试用)

<span style="color:blue">$rebase</span>：自动处理 PIE 偏移

<span style="color:purple">codebase</span>：打印 PIE 偏移(本地😅)

<span style="color:red">stack</span>：查看栈

<span style="color:orange">retaddr</span>：定位返回地址

<span style="color:yellow">canary</span>：直接看 canary(仅本地有用,而且每次都会变😅)

<span style="color:green">plt</span>：查看 PLT

<span style="color:cyan">got</span>：查看 GOT

<span style="color:blue">hexdump</span>：ida 风格 hex 显示

> to be continued...

that is end~😇

感谢阅读!😇

</div>