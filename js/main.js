var uid = "";
var uname = "";

// 現在ログインしているユーザを取得する
firebase.auth().onAuthStateChanged((user) => {
  let h3 = document.querySelector('h3');

  if (user) {
    uid = user.uid;
    uname = user.displayName;
  }
});

// firebaseとデータ入れにmessagesという名前を付けて使えるようにする
const db = firebase.firestore();
const collection = db.collection('messages');

// formとmessage要素の取得
const inputMessage = document.getElementById('inputMessage');
const form = document.querySelector('form');
const messageList = document.getElementById('messageList');

// DBからmessagesを取得
collection.orderBy('created').onSnapshot(snapshot => {
  // messages（snapshot）の中身を1つ1つ（change）見る
  snapshot.docChanges().forEach(change => {
    if (change.type == 'added') {
      console.log(change.doc.data())
      // 要素(p,div)を追加
      const textMessage = document.createElement('p');
      const name = document.createElement('p');
      const time = document.createElement('p');
      const body = document.createElement('div');
      const item = document.createElement('div');

      // テキスト内容を取得
      textMessage.textContent = change.doc.data().message;

      // 時を取得
      const hour = change.doc.data({ serverTimestamps: "estimate" }).created.toDate().getHours();
      // 分を取得
      const minute = change.doc.data({ serverTimestamps: "estimate" }).created.toDate().getMinutes();
      // 時:分で表示
      time.textContent = hour + ':' + minute;

      // メッセージを投稿したユーザIDとログインユーザIDを比較
      if (change.doc.data().id === uid) {
        item.appendChild(time);
        const innerItem = document.createElement('div');

        name.textContent = uname;
        innerItem.appendChild(name);
        innerItem.appendChild(textMessage);

        // 自分が送ったメッセージ
        body.classList.add('right_message');
        item.appendChild(innerItem);
      } else {
        // 相手が送ったメッセージ
        item.appendChild(textMessage);
        item.appendChild(time);
        body.classList.add('left_message');
      }

      // body(親)にitem(子)を入れる
      body.appendChild(item);

      item.classList.add('item');
      textMessage.classList.add('textMessage');
      name.classList.add('name');
      time.classList.add('time');
      messageList.appendChild(body);
    }
  });
});

//formの投稿イベント、投稿されたらページ遷移しないように
form.addEventListener('submit', e => {
  
  //メッセージが空だった時にそれ以降の処理をしない
  const val = inputMessage.value.trim();
  if (val == "") {
    return;
  }
  post(val);
  e.preventDefault();
})

// 投稿する関数
function post(val){
  //フォームを空にしてフォーカスをあてる（処理成功の場合にあったものを移動）
  inputMessage.value = '';
  inputMessage.focus();

  //データ入れにデータを保存してIDをふる
  collection.add({
    message: val,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    id: uid
  })
    .then(doc => {
      //処理が成功した場合はコンソールにIDを表示し
      //messageの中身は空にし、フォームにフォーカスを当てる
      console.log(`${doc.id} added!`);
    })
    .catch(error => {
      //処理が失敗した場合は、コンソールにエラーメッセージを表示
      console.log(error);
    });
}

// キーが押された時の処理
function pushed(e) {

  // キーロガー表示
  console.log(e);

  //メッセージが空だった時にそれ以降の処理をしない
  const val = inputMessage.value.trim();
  if (val == "") {
    return;
  }

  // Ctrl+Enterで投稿
  if (e.code === 'Enter' && e.ctrlKey) {
    //console.log("pass")
    post(val);
  } else {
    return;
  }
};

//ページ読み込み時にフォーカスをあてる
inputMessage.focus();