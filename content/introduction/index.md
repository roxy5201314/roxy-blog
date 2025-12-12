---
title: "the beginning of your ctf journey"
excerpt: "简单介绍一下ctf"
date: "2025-12-09"
-slug: "hello world!"
+slug: "hello-world"
section: "introduction"
---

<div class="intro-article">

# 🎮 <span style="color:#ffcc00">CTF 到底是什么???</span>

如果你第一次听到 **CTF（Capture The Flag）**，  
放心，you are not alone 😄  

顾名思义，比赛围绕 **<span style="color:#ff6b6b">"flag"</span>** 这个关键词展开，  
无论干什么，最终目的都是：

>  **获得 flag 并上传（形如 `flag{}`）**

小时候曾经在 *亲爱的热爱的* 这部电视剧上看到过 ctf 这门比赛，  
没想到如今长大后竟能有所接触，  
*缘分果真妙不可言*😅

当然，你可能要问：

>  **为什么要参加这门比赛?**

---

##  <span style="color:#6bc5ff">为什么选择 CTF</span>

安全这门学科是**非常需要实践**而非仅仅停留在理论层面的，  
而 CTF 这样的比赛恰好为你搭建了一个：

>  **合法**  
>  **自由发挥**  
>  **可以尽情折腾的舞台**

你需要不断学习：

- 新工具的使用  
- 你缺失的前置知识  
- 以及被题目反复摩擦的心态qwq

但当你最终：

>  **获得 shell**  
>  **拿到 flag**

那种快感是**无可比拟的**，  
只有你自己真正做过，才能体会。

这种强烈正反馈的 **learning mode**，  
会带来非常巨大的成长!😄😄

---

##  CTF 的五大方向

下面简单介绍一下主流 CTF 题目的 **<span style="color:#ff9f1c">五大方向</span>**：

---

## 🧨 <span style="color:#ff6b6b">PWN —— 二进制漏洞利用</span>  
*(my favourite,夹带私货😏😏😏)*

> **享受控制程序执行流的乐趣，来自最底层的绝对掌控!**

###  关键词：

- 栈溢出
- 堆漏洞
- ROP / SROP
- UAF / Double Free

###  题目通常像这样：

- 给程序一个“看起来很正常”的输入  
- 实则是你精心布局的恶意代码  
- 程序的执行流被你悄悄劫持  
- 一步一步走上你为它搭设的道路...

最终：

>  *碰!*  
>  **程序被 hijack，最高控制权到手!**

>  如果你喜欢 **底层 / 汇编 / 内存 / 支配 / 掌控 / M(bushi)**  
>  那 **PWN 非常适合你!**

---

## 🌐 <span style="color:#4dabf7">Web —— 世界上 Bug 最多的地方</span>

> **我只是写个登录，怎么就被打穿了？？？**

###  关键词：

- SQL Injection
- XSS / CSRF
- 文件上传
- SSRF
- 逻辑漏洞

###  Web 的优点：

- **见效快**
- **贴近真实世界**
- 写代码的人越多，漏洞就越多（不是我说的）😎

but：

- **学的东西是真的杂 😞😞😞**
- 语言、框架、网络、安全策略全都要碰

>  如果你会一点前端 / 后端  
>  或者想搞真实世界安全  
>  **Web 是你的首选!**

---

## 🔍 <span style="color:#51cf66">Reverse —— 逆向工程</span>  
*(含金量😎😎😎，大佬云集)*

### 🔑 关键词：

- 反汇编
- IDA / Ghidra
- 控制流分析
- 动态调试
- 花指令

ps:  
其实我也不太了解...

>  如果你喜欢 **分析 / 推理 / 抽丝剥茧**  
>  Reverse 会让你非常上头!

**不过：**

>  **无 PWN，不逆向，本质都是对底层的理解 ❤️❤️❤️**

---

##  <span style="color:#845ef7">Crypto —— maths feast</span>  
**(可以请教一下 *Wisif*)**

> **你以为这是加密，其实这是小学数学!(数论...)**

###  关键词：

- RSA
- ECC
- 哈希
- LCG
- 奇怪的自制算法(😭)

Crypto 很少让你实现算法，  
**更多是让你去「拆穿」算法。**

> ✅ 如果你喜欢 **数学 / 数学 / 数学**  
> ✅ Crypto 非常纯粹，也非常优雅

---

## 🧩 <span style="color:#ffa94d">Misc —— 万物皆可 Misc</span>

> **Misc = 题目作者想不进分类的都在这**

###  关键词：

- 编码（Base / Morse / Ook）
- LSB 隐写 / 音频隐写
- 流量分析 / 压缩包分析
- OSINT(盒!)
- 奇怪工具链  
  *(stegsolve / binwalk / winhex / wireshark ...)*

###  Misc 非常适合：

-  新手入门
-  打开脑洞

ps：  
重点表扬曾经做过的  
**传奇哈基米语言 & 何意味大师 😁😁😁**

>  如果你喜欢 **折腾 / 搜索资料 / 开盒! / 丰富技能包**  
>  Misc 是你入门最好的起点

---

##  <span style="color:#ff8787">为什么要写这个 blog?</span>

ps：纯属无聊...  

我不保证每篇都有用（随便写写），  
但我保证：

> **这是我自己走过的路（有点唐）**

---

##  <span style="color:#ffd43b">最后一句</span>

如果你也在 CTF 这条路上：

- 菜很正常
- 什么都看不懂也很正常
- 被秒杀更正常

分享我非常喜欢的一段话：❤️❤️

*No  one  does  when  they  begin,*  
*Ideas  don't  come  out  fully  formed,*  
*They  only  become  clear  as  you  work  on  them,*  
*You  just  have to  get  started!*

---

> ps:为了写作的交互感强，我添加了许多emoji

> 但是如果添加过多表情包影响了您的阅读，我深感抱歉，下次一定注意😭😭

> **roxy 也许正在创作中**  
> *(大概率先睡一会儿...😴😴😴)*
</div>