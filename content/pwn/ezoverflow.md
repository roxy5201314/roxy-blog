---
title: "ezoverflow"
excerpt: "understand the stackframe of function"
date: "2025-12-09"
slug: "ezoverflow"
section: "pwn"
---

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

先忽略这些复杂的参数...