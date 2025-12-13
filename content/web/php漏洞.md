---
title: "php漏洞"
excerpt: "从一道题看看php的一些安全漏洞与利用技巧"
date: "2025-12-13"
slug: "php-vulnerability"
section: "web"
---

<div class="intro-article">

源码:

```php
<?php
highlight_file(__FILE__);
include_once('flag.php');
if(isset($_POST['a'])&&!preg_match('/[0-9]/',$_POST['a'])&&intval($_POST['a'])){
    if(isset($_POST['b1'])&&$_POST['b2']){
        if($_POST['b1']!=$_POST['b2']&&md5($_POST['b1'])===md5($_POST['b2'])){
            if($_POST['c1']!=$_POST['c2']&&is_string($_POST['c1'])&&is_string($_POST['c2'])&&md5($_POST['c1'])==md5($_POST['c2'])){
                echo $flag;
            }else{
                echo "yee";
            }
        }else{
            echo "nop";
        }
    }else{
        echo "go on";
    }
}else{
    echo "let's get some php";
}
?>
```

WP:

考察：类型混淆 + 宽松比较(magic hash)

> 1.isset($_POST['a']) && !preg_match('/[0-9]/', $_POST['a']) && intval($_POST> ['a']) 

用法误假设 $_POST['a'] 是字符串

提交 a[]=6(数组)会让 preg_match 在传数组时产生 warning 并返回 false

因此 !preg_match 为 true

intval(array) 在常见 PHP 版本下不会抛致命错误，结果为 1 / truthy （仍有 warning）

因此整行成立!

> 2.isset($_POST['b1']) && $_POST['b2']

只检查 b1 是否设置且 $_POST['b2'] 为 truthy（没有 isset）

提交 b1[]=hello 与 b2[]=hacker（不同数组）即可满足!

> 3.$_POST['b1'] != $_POST['b2'] && md5($_POST['b1']) === md5($_POST['b2'])

b1 != b2：不同数组互不相等，成立。

md5($_POST['b1']) 与 md5($_POST['b2'])

传数组给 md5() 会产生 warning 并返回 NULL（或非字符串）

所以 NULL === NULL 为真!

即利用了对不正确类型没有类型检查的行为!

> 4.$_POST['c1'] != $_POST['c2'] && is_string($_POST['c1']) && is_string($_POST['c2']) && md5($_POST['c1']) == md5($_POST['c2'])

这里要求 c1 和 c2 是字符串（is_string），且两者不相等

但 md5(...) == md5(...)（注意是宽松比较 ==）为真

这是经典的 PHP “magic hash” 漏洞利用点：

如果两个不同字符串的 md5 都形如 "0e...全是数字..."（例如 "0e46209..."）

在 PHP 的宽松比较 == 下会被当做科学计数法（0e...）并被解析为数字 0，从而认为相等

常见的可用 pair(历史上广为人知的“magic hash”示例):

c1 = 240610708

c2 = QNKCDZO

这两个字符串互不相同

但是!

md5("240610708") 与 md5("QNKCDZO") 都以 0e... 开头(都是全数字尾)

用 == 比较会被当作 0，所以 md5(c1) == md5(c2) 为真!

因此把 c1 与 c2 赋为上面这样的“magic hash”字符串即可!

最终payload:

curl -s -X POST \

  -d "a[]=6" \

  -d "b1[]=hello" \

  -d "b2[]=hacker" \

  -d "c1=240610708" \

  -d "c2=QNKCDZO" \

  http://target/

得到flag

flag{1c29f312-3f3b-4ccb-9963-5ed647525f92}

perfect!😎

> 复盘

防御建议

1.严格类型检查输入：

先用 is_string() / is_numeric() / is_array() 等判断类型

或者使用 filter_input(INPUT_POST, 'a', FILTER_VALIDATE_INT) 等过滤器

2.不要对来源不明的值直接用于 string-only 函数：

在调用 preg_match, md5, intval 前确保是字符串或整型。

例如：if (!is_string($_POST['a'])) { /* reject */ }

> 永远不要相信用户的输入!!!

3.比较哈希时使用 hash_equals 与严格比较（并确保都是字符串）：

if (is_string($h1) && is_string($h2) && hash_equals($h1, $h2)) { ... }

hash_equals 防止时序攻击外，加上 is_string 可避免 0e... 宽松比较问题。

4.避免使用 == 比较散列，应该用 === 或 hash_equals。

5.不要依赖 intval() 对不确定类型进行 truthy 检查

对数字请先验证 ctype_digit 或 filter_var(..., FILTER_VALIDATE_INT)。

6.显示/记录 warnings 而不是静默忽略，并在生产环境禁用 display_errors

但确保日志记录用于安全审计。

7.统一输入处理层：把所有 POST 输入规范化成你期望的类型（例如一律取字符串或数组）

拒绝非期望类型。

安全代码示例:

```php
<?php
highlight_file(__FILE__);
include_once('flag.php');
function get_post_string($key) {
    if (!isset($_POST[$key])) return null;
    if (!is_string($_POST[$key])) return null;
    return $_POST[$key];
}
$a = get_post_string('a');
$b1 = get_post_string('b1');
$b2 = get_post_string('b2');
$c1 = get_post_string('c1');
$c2 = get_post_string('c2');

if ($a !== null && preg_match('/^[0-9]+$/', $a) && intval($a) !== 0) {
    if ($b1 !== null && $b2 !== null) {
        if ($b1 !== $b2 && hash_equals(md5($b1), md5($b2))) {
            if ($c1 !== $c2 && hash_equals(md5($c1), md5($c2))) {
                echo $flag;
            } else {
                echo "yee";
            }
        } else {
            echo "nop";
        }
    } else {
        echo "go on";
    }
} else {
    echo "let's get some php";
}
?>
```

over~🥸

感谢阅读！🥸

</div>