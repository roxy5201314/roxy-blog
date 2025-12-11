---
title: "pwn入门"
excerpt: "pwn所需的工具和环境搭建"
date: "2025-12-09"
-slug: "hello pwn!"
+slug: "hello-pwn"
section: "pwn"
---

<div class="intro-article">

# 欢迎来到PWN的世界

***你需要什么?***

## 1.既然来到了这里，想必你已经在自己的电脑上安装好了任意型号(Ubuntu/Debian...)的linux系统

如果还没有

操作也是非常简单

推荐先使用 *VMWARE虚拟机* 和 *Ubuntu* 系统

对新手友好

照着装就行了😀

直接给你网址吧 😎  
VMWARE：https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion  
Ubuntu：https://cn.ubuntu.com/download

到这里

> 恭喜你!🎇🎇

欢迎来到安全的主战场-linux系统

##  <span style="color:#ffcc00">2.你所需要的知识</span>

- 什么是ELF文件?🥰

- 基础汇编语言(lea,je,jne,leave,ret,call,mov,sub,add,pop,push...)

能看懂一点就行

- 通用寄存器调用约定(rdi,rsi,rdx,rax,r10,r8,r9...)

先有个印象

- 认识你最需要关注的三个东西(rbp,rsp,***rip***)

**控制程序执行流的关键**

- c语言🙄🙄

每次写代码时都想想在最底层的内存地址上发生着哪些变化...

- linux基本命令

我列举一些，慢慢学吧，可以问问豆包☺️

cd  ls  mv  rm  cp  mkdir  pwd  cat  vim/nano

less more tail head id whoami ps nc chmod...

**常用**

> file   checksec   readelf   objdump   strings

0 stdin  1 stdout  2 stderr

>  < >  (重定向)   |   (pipe)...

## 3.你所需要的工具

- python环境  并安装**pwntools**库

- gdb 搭配 *pwndbg*(调试,难题必备)

- ghidra/ida pro(反汇编)

ps:只能推荐本人使用过的，因为我也是新手TTqwq😭😭

</div>