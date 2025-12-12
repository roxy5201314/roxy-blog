---
title: "什么是SQL注入?"
excerpt: "根据dvwa靶场的4道题目简单介绍一下sqli技术"
date: "2025-12-12"
slug: "sqli"
section: "web"
---

<div class="intro-article">

<span style="color:#51cf66">欢迎来到web方向!</span>

## 今天介绍一下入门级的漏洞 <span style="color:#ffd43b">sql injection</span>

题目来自dvwa靶场的sqli练习😳

# low level

源码:

```php
<?php

if( isset( $_REQUEST[ 'Submit' ] ) ) {
    // Get input
    $id = $_REQUEST[ 'id' ];

    // Check database
    $query  = "SELECT first_name, last_name FROM users WHERE user_id = '$id';";
    $result = mysqli_query($GLOBALS["___mysqli_ston"],  $query ) or die( '<pre>' . ((is_object($GLOBALS["___mysqli_ston"])) ? mysqli_error($GLOBALS["___mysqli_ston"]) : (($___mysqli_res = mysqli_connect_error()) ? $___mysqli_res : false)) . '</pre>' );

    // Get results
    while( $row = mysqli_fetch_assoc( $result ) ) {
        // Get values
        $first = $row["first_name"];
        $last  = $row["last_name"];

        // Feedback for end user
        echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
    }

    mysqli_close($GLOBALS["___mysqli_ston"]);
}

?>
```

最简单的sql注入

ps:你可能需要先了解一些sql语法(不过非常简单)

> 先掌握DELETE SELECT INSERT UPDATE

开始!

观察到核心逻辑:

> SELECT first_name, last_name FROM users WHERE user_id = '$id';

用户输入直接拼接到SQL且无过滤，无类型检查

先输入

> 1' OR '1'='1' #

语句变为user_id = '1' OR '1'='1' #...(被注释掉了)

1=1恒真，加上or的逻辑

计算机直接将该语句判定为真并返回了所有的用户名字

因此存在注入点

接下来看一下基本信息

输入

> 1' UNION SELECT database(),'a' #

返回dvwa

ps:1'闭合前面语句，#注释掉后续语句,中间执行任意代码!

然后获取表名

> 1' UNION SELECT table_name, 'a' FROM information_schema.tables WHERE table_schema='dvwa' #

得到表名

> users

接下来我们获得列名

> 1' UNION SELECT column_name, 'a' FROM information_schema.columns WHERE table_name='users' #

得到列名

> 重点:user password

接下来读取敏感信息

> 1' UNION SELECT user,password FROM users #

成功获得所有用户的密码!

## medium level
源码
```php
<?php

if( isset( $_POST[ 'Submit' ] ) ) {
    // Get input
    $id = $_POST[ 'id' ];

    $id = mysqli_real_escape_string($GLOBALS["___mysqli_ston"], $id);

    $query  = "SELECT first_name, last_name FROM users WHERE user_id = $id;";
    $result = mysqli_query($GLOBALS["___mysqli_ston"], $query) or die( '<pre>' . mysqli_error($GLOBALS["___mysqli_ston"]) . '</pre>' );

    // Get results
    while( $row = mysqli_fetch_assoc( $result ) ) {
        // Display values
        $first = $row["first_name"];
        $last  = $row["last_name"];

        // Feedback for end user
        echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
    }

}

// This is used later on in the index.php page
// Setting it here so we can close the database connection in here like in the rest of the source scripts
$query  = "SELECT COUNT(*) FROM users;";
$result = mysqli_query($GLOBALS["___mysqli_ston"],  $query ) or die( '<pre>' . ((is_object($GLOBALS["___mysqli_ston"])) ? mysqli_error($GLOBALS["___mysqli_ston"]) : (($___mysqli_res = mysqli_connect_error()) ? $___mysqli_res : false)) . '</pre>' );
$number_of_rows = mysqli_fetch_row( $result )[0];

mysqli_close($GLOBALS["___mysqli_ston"]);
?>

```

题目难度略微增加

界面不再有表单提交

改为了下拉选择(现实谁会这样😹😹)

不过不影响我们利用🙈🙈

观察题目逻辑为使用post传递id

且关键1:

> SELECT first_name, last_name FROM users WHERE user_id = $id;

关键2:

> 使用了mysqli_real_escape_string,' "会被过滤

既然无法输入信息

那么这时候，就要拿出我们的抓包神器burpsuite了😡

下载地址: https://portswigger.net/burp/communitydownload

打开proxy

open browser

先打开intercept模式

你会看到

> intercept is on!

然后点击submit

打开burpsuite查看抓包得到的信息

你会看到:

POST /vulnerabilities/sqli/?id=1&Submit=Submit HTTP/1.1

Host: localhost:8000(我随便开的端口...)

...

id=1&Submit=Submit

哈哈，在这里注入就行了吧😎😎

同理(注意没有'的逻辑了)

直接改为

> id=1 UNION SELECT user,password FROM users #&Submit=Submit

成功!😎

## high level

源码

```php
<?php

if( isset( $_SESSION [ 'id' ] ) ) {
    // Get input
    $id = $_SESSION[ 'id' ];

    // Check database
    $query  = "SELECT first_name, last_name FROM users WHERE user_id = '$id' LIMIT 1;";
    $result = mysqli_query($GLOBALS["___mysqli_ston"], $query ) or die( '<pre>Something went wrong.</pre>' );

    // Get results
    while( $row = mysqli_fetch_assoc( $result ) ) {
        // Get values
        $first = $row["first_name"];
        $last  = $row["last_name"];

        // Feedback for end user
        echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
    }

    ((is_null($___mysqli_res = mysqli_close($GLOBALS["___mysqli_ston"]))) ? false : $___mysqli_res);        
}

?>
```

这次不看你的id了

> 直接看你修改的$_SESSION['id'] 的值

所以我们直接进入change session id的地方

依旧burpsuite抓包

题目逻辑还是

> SELECT first_name, last_name FROM users WHERE user_id = '$id' LIMIT 1;

payload

> 1' UNION SELECT user,password FROM users #&Submit=Submit

成功!😎

## impossible level

源码

```php
<?php

if( isset( $_GET[ 'Submit' ] ) ) {
    // Check Anti-CSRF token
    checkToken( $_REQUEST[ 'user_token' ], $_SESSION[ 'session_token' ], 'index.php' );

    // Get input
    $id = $_GET[ 'id' ];

    // Was a number entered?
    if(is_numeric( $id )) {
        // Check the database
        $data = $db->prepare( 'SELECT first_name, last_name FROM users WHERE user_id = (:id) LIMIT 1;' );
        $data->bindParam( ':id', $id, PDO::PARAM_INT );
        $data->execute();
        $row = $data->fetch();

        // Make sure only 1 result is returned
        if( $data->rowCount() == 1 ) {
            // Get values
            $first = $row[ 'first_name' ];
            $last  = $row[ 'last_name' ];

            // Feedback for end user
            echo "<pre>ID: {$id}<br />First name: {$first}<br />Surname: {$last}</pre>";
        }
    }
}

// Generate Anti-CSRF token
generateSessionToken();

?>
```

ok观察这个源码

发现:

> 根本不可能能sql注入

其实这是一次安全查询的示范

学习了攻击，也要学习如何防守

<span style="color:#ff6b6b">为什么这个代码这么安全?</span>


- CSRF token 校验：修改请求需要合法 token（减少可直接构造的请求面）

- 类型检查 is_numeric()：非数字输入直接被丢弃，不会进入查询!

- Prepared statement + bindParam(..., PDO::PARAM_INT)：即使能把输入送进查询，也会按整型绑定，无法把 SQL 片段注入进查询结构!

- LIMIT 1 + rowCount check：限制返回行数并确认只有 1 行，降低信息泄露面。

企业级安全中最标准的防御😎😎

## 最后:

sql注入不止于此

题目中可能还有各种各样的注入方式亦或绕过逻辑

> 等待着你这名hacker去attack!😎

其实还有一个自动化工具叫做sqlmap

不过

只会使用工具是不行的(你会被称作*脚本小子*😄)

最好理解其原理😎😎

## 小插曲

最后谈谈个人的一点小感受:(可以跳过)

在短视频平台无意看到这样一句话:

现在基本都不用php了，都过时了，你学这些干嘛?

初看感觉似乎说的在理

细思，实则不然

php 并不是 web 漏洞的本质。

漏洞不依赖具体哪门**语言**，漏洞依赖“业务+人写的代码+架构”。

往更深点说

SQL注入的本质其实是**输入验证逻辑的缺失**

这些东西在 go、node、java、python、ruby 依旧存在。

现在我们用php这门语言学的是底层逻辑与安全思维，后面完全能**迁移**。

***因此***

完全不必焦虑或怀疑自己

> all your work will pay off

that is end~😀

感谢阅读~😀

</div>