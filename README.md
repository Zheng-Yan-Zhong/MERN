# MERN application

## Project Structure
* Client
    * react.js
* Server
    * mongoose(ODM)
    * express.js
        * cors
    * packages
        * bcrypt
        * nodemon
* Database
    * mongoDB Atlas

![](./images/mern-structure-main.png)

---

## Start

先配置好React.js的部分

```javascript
//index.js
import ReactDom from 'react-dom'
import App from './page/Home'

ReactDom.render(
    <App />,
    document.getElementById('root')
)
```

```javascript
//Home.js
import React from 'react'

function Home() {
  return (
    <div>
        <h2>MERN Login</h2>
        <input type="text" placeholder='username' />
        <input type="text" placeholder='password'/>
        <input type="text" placeholder='email' />
        <button>register</button>
    </div>
  )
}

export default Home
```

綁定input event
```javascript
import React, { useState } from 'react'

function Home() {
  const [user, setUser] = useState({
    username: "",
    password: "",
    email: ""
  })
  async function register() {
    console.log(user);
  }

  return (
    <div>
        <h2>MERN Login</h2>
        <input type="text" value={user.username} onChange={(event) => setUser({...user, username: event.target.value})} placeholder='username' />
        <input type="text" value={user.password} onChange={(event) => setUser({...user, password: event.target.value})} placeholder='password'/>
        <input type="text" value={user.email} onChange={(event) => setUser({...user, email: event.target.value})} placeholder='email' />
        <button onClick={register}>register</button>
    </div>
  )
}

export default Home
```

register method

```javascript
  async function register() {
    console.log(user);
    fetch('http://localhost:3001', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(user)
    })
  }
```

![](./images/registerMethod.png)

接下來我們切換到Server的部分

```javascript
npm install nodemon express
//nodemon為hotreload
```

並且在package.json新增腳本
```javascript
"dev": "nodemon main.js" 
```

![](./images/packageScript.png)

```javascript
//main.js
const express = require('express')
const app = express()

app.use(express.json())
//request will be json

app.listen(3001, function() {
    console.log("running");
}) 
```

![](./images/json.png)


建立一個get method

```javascript
app.get('/', function(req, res) {
    res.send('Hello World')
})
```

![](./images/get.png)


下載cors套件
```javascript
npm install cors
```
使express application可以接受跨域請求
```javascript
//main.js
app.use(cors())
```

建立post method
```javascript
app.post('/user/register', function(req, res) {
    const {username, password, email} = req.body// get request.body
    res.json({res: "user Hi"})
})
```

而我們在前端的fetch

```javascript
  async function register() {
    console.log(user);
    fetch('http://localhost:3001/user/register', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then((res) => res.json())//轉json格式
    .then((data) => console.log(data))//取得整個response
    .catch((err) => console.log(err))
  }
```

![](./images/getMethod.gif)


接下來我們到[mongoDB Atlas](./images/step1.png)

建立一個叢集

![](./images/step2.png)

建立資料庫 mern-User

集合名稱 users

![](./images/createMongoDB.png)


> 這邊會用小寫並且複數型態,由於mongoose 建立model會採取自動轉小寫且複數


> ![](./images/modelRule.png)

接下來回到叢集頁面

點選connect

![](./images/step1.png)

connect to application

![](./images/step2.png)

![](./images/step3.png)

複製完成之後,回到server下載mongoDB的ODM

使用ODM可以避免直接操作資料庫,使用對應的方法取得資料

```javascript
npm install mongoose
```

建立與mongoDB Atlas的連線
```javascript
//main.js
const mongoose = require('mongoose')
const db = "mern-User"

mongoose.connect(`mongodb+srv://root:<password>@project.bfzl8.mongodb.net/${db}?retryWrites=true&w=majority`)
```

接著我們建立一個model的資料夾

```javascript
//user.js
const mongoose = require('mongoose')

const User = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    created: {
        type: Date,
        default: new Date().toDateString()
    }
})

const UserModel = new mongoose.model('User', User)

module.exports = UserModel
```

並且在main.js引用
```javascript
const user = require('./models/user')
```
在app.post方法中使用model.create()
```javascript
app.post('/user/register', function(req, res) {
    const {username, password, email} = req.body// get request.body
    userModel.create({username: username, password: password, email: email})
    res.json({res: "user Hi"})
})
```

目前資料夾結構

![](./images/model.png)

```javascript
//main.js
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const db = "mern-User"
const userModel = require('./models/user')
app.use(express.json())
//request will be json
app.use(cors())

//db
mongoose.connect(`mongodb+srv://root:root@project.bfzl8.mongodb.net/${db}?retryWrites=true&w=majority`)

app.listen(3001, function() {
    console.log("running");
})

//* APIs

app.get('/', function(req, res) {
    res.json('OK')
})

app.post('/user/register', function(req, res) {
    const {username, password, email} = req.body// get request.body
    userModel.create({username: username, password: password, email: email})
    res.json({res: "user Hi"})
})
```

![](./images/pushDB.gif)

但我們現在少了一個很重要的動作

我們的密碼是明文,這樣太危險

下載bcrypt套件

[bcrypt github](https://github.com/kelektiv/node.bcrypt.js/)
```javascript
npm install bcrypt
```

![](./images/bcryptMethod.png)

```javascript
//main.js
const bcrypt = require('bcrypt')

//API
app.post('/user/register', function(req, res) {
    const saltTime = 10
    const {username, password, email} = req.body// get request.body
    bcrypt.hash(password, saltTime, function(err, hash) {
        userModel.create({username: username, password: hash, email: email})
    })
    res.json({res: "user Hi"})
})
```

![](./images/hashPassWord.gif)


接下來我們實作登入

在剛剛的註冊頁面再添加login的html和方法

```javascript
import React, { useState } from 'react'

function Home() {
  const [user, setUser] = useState({
    username: "",
    password: "",
    email: ""
  })

  const [login, setLogin] = useState({
    username: "",
    password: ""
  })
  async function register() {
    console.log(user);
    fetch('http://localhost:3001/user/register', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(user)
    })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err))
  }
  async function loginFN() {
    console.log(login);
  }

  return (
    <div>
        <h2>MERN Register</h2>
        <input type="text" value={user.username} onChange={(event) => setUser({...user, username: event.target.value})} placeholder='username' />
        <input type="text" value={user.password} onChange={(event) => setUser({...user, password: event.target.value})} placeholder='password'/>
        <input type="text" value={user.email} onChange={(event) => setUser({...user, email: event.target.value})} placeholder='email' />
        <button onClick={register}>register</button>

        <h2>MERN Login</h2>
        <input type="text" onChange={(event) => setLogin({...login, username: event.target.value})} value={login.username} placeholder='username' />
        <input type="text" onChange={(event) => setLogin({...login, password: event.target.value})} value={login.password} placeholder='password' />
        <button onClick={loginFN}>login</button>
    </div>
  )
}

export default Home
```

建立一個/user/login api

```javascript
app.post('/user/login', function(req, res) {
    const { username, password } = req.body
    userModel.find({username: username}, function(err, data) {
        if(data.length == 0) {
            return res.json({text: "not found user"})
        } else {
            res.json({data: data})
        }
    })
})
```

我們先透過res.json傳資料到前台看看

![](https://i.imgur.com/YVlTdVh.png)

這樣我們就知道如果沒有使用者就會回傳空陣列

可以透過data.length == 0 做判斷

並且透過bcrypt的compare方法比對資料庫中hash的密碼
```javascript
app.post('/user/login', function(req, res) {
    const { username, password } = req.body
    userModel.find({username: username}, function(err, data) {
        if(data.length == 0) {
            return res.json({text: "not found user"})
        } else {
            res.json({data: data})
            bcrypt.compare(password, data[0].password, function(error, result) {
                if(result) {
                    res.json({text: result})
                } else {
                    res.json({text: "password error"})
                }
            })
        }
    })
})
```

前台的部分 判斷回傳的text為true才會執行
```jsx=
        {
          isLogin? <h1>Hi User</h1> : null
        }
```

```javascript
const [isLogin, setIsLogin] = useState(false)

//method
  async function loginFN() {
    console.log(login);
    fetch('http://localhost:3001/user/login', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(login)
    })
    .then((res) => res.json())
    .then((data) => {
      if(data.text === true) {
        console.log(data.text);
        setIsLogin(true)
      }
    })
    .catch((err) => console.log(err))
  }
```

![](./images/finish.gif)


大功告成拉～～～～～