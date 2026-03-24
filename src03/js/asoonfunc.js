//リセットボタンを押したときの処理
function reset_click(){
    //リセットの確認
    if(window.confirm('データをリセットします。よろしいですか？')){
        //OKの時の処理

        //所持金をリセット
        localStorage.setItem('money', 5000);

        //スタンプの数をリセット
        localStorage.setItem('stamp', 0);
        alert("データをリセットしました。");

        location.reload();
    }
}

