// чистый js
window.onload = function(){
    //массив для создания корзины
    let cart = {};
    let goods ={};
    
    //загрузка корзины из localstorage
    function loadCartFromStorage(){
        //осуществлять parse только в случае, если массив корзины существует
        if(localStorage.getItem('cart')!= undefined){
            cart = JSON.parse(localStorage.getItem('cart'));
        }
        console.log(cart);
    }
    
    loadCartFromStorage();
    
    //отправление запроса ajax вместо $.getJSON
    let getJSON = function(url, callback){
        let xhr = new XMLHttpRequest();
        xhr.open('GET',url,true);
        xhr.responseType = 'json';
        xhr.onload = function(){
            let status = xhr.status;
            if(status == 200){
                callback(null, xhr.response)
            }
            else{
                callback(status, xhr.response)
            }
        };
        xhr.send();
    }
    
    //посылаем сам запрос
    
    getJSON('http://spreadsheets.google.com/feeds/list/1IyG8Atb01IMF1w79Mwfc-IVjlEM2M6Bo9-K2BOfWcaw/od6/public/values?alt=json', function(err,data){
        console.log(data);
        if(err != null){
            alert('Error:'+err);
        }
        else{
            data = data['feed']['entry'];
            console.log(data);
            goods = arrayHelper(data);
            console.log(goods);
            document.querySelector('.shop-field').innerHTML = showGoods(data);
            showCart();
        }
    });
    
    function showGoods(data){
        let out = '';
        
        for(var i = 0; i<data.length; i++){
        if (data[i]['gsx$show']['$t']!=0){
            out+=`<div class="col-lg-3 col-md3 col-sm2" style="width:200px;
            margin-bottom:2%;">`;
            out+=`<div class="goods" style="text-align:center;">`;
            out+=`<h4>${data[i]['gsx$name']['$t']}</h4>`;
            out+=`<img src="${data[i]['gsx$image']['$t']}">`;
            out+=`<h5 class="cost">Цена:${data[i]['gsx$cost']['$t']}</h5>`;
            out+=`<h5 class="kg">На складе:${data[i]['gsx$kg']['$t']}кг</h5>`;
            out+=`<h5><button type="button" class="btn btn-success" name = "add-to-cart" data="${data[i]['gsx$id']['$t']}">Купить</button></h5>`;
            out+=`</div>`;
            out+=`</div>`;
            }    
        }
return out;
    }
    
    document.onclick = function(e){
       if(e.target.attributes.name != undefined){
//            console.log(e.target.attributes.data.nodeValue);
            if(e.target.attributes.name.nodeValue =='add-to-cart'){
                addToCart(e.target.attributes.data.nodeValue);
            }
            //удаление элемента из корзины
            else if(e.target.attributes.name.nodeValue =='delete-goods'){
                delete cart[e.target.attributes.data.nodeValue]; 
                //перерисовка корзины
                showCart();
                //перезапись корзины
                localStorage.setItem('cart', JSON.stringify(cart));
                console.log(cart);
            }
            //добавление товара +
           else if(e.target.attributes.name.nodeValue =='plus-goods'){
                cart[e.target.attributes.data.nodeValue]++;
               showCart();
               localStorage.setItem('cart', JSON.stringify(cart));
            }
            //удаление товара -
            else if(e.target.attributes.name.nodeValue =='minus-goods'){
               //чтобы не уйти в минус товара
                    if(cart[e.target.attributes.data.nodeValue]- 1 == 0){
                    delete cart[e.target.attributes.data.nodeValue]; 
                    }
                    else{
                        cart[e.target.attributes.data.nodeValue]--;  
                    }
                    showCart();
                    localStorage.setItem('cart', JSON.stringify(cart)); 
            }
            else if(e.target.attributes.name.nodeValue == 'buy'){
                    var name = document.getElementById('customer-name').value;
                    var email = document.getElementById('customer-email').value;
                    var phone = document.getElementById('customer-phone').value;
                    console.log(name+email+phone);
                    var data = {
                         name : document.getElementById('customer-name').value,
                         email : document.getElementById('customer-email').value,
                         phone : document.getElementById('customer-phone').value,
                         cart : emailArray(),
                    };
                
                    fetch("php_mail/mail.php",
                    {
                        method: "POST",
                        body: JSON.stringify(data)
                    })
                    .then(function(res){ 
                    console.log(res);
                        if (res){
                        alert('Ваш заказ отправлен');
                        }
                        else {
                        alert('Ошибка заказа');
                        }
                    })
            }
        }
    }
    
    function emailArray(){
        var emailArray = {};
        for(var key in cart){
            //key - id товара cart[key] - количество
            var temp = {};
            temp.name = goods[key]['name'];
            temp.cost = goods[key]['cost'];
            temp.articul = goods[key]['articul'];
            temp.count = cart[key];
            emailArray[key] = temp;
        }
//        console.log(emailArray);
        return emailArray;
    
    }
    
    function addToCart(elem){
        if(cart[elem]!==undefined){
           cart[elem]++;
           }
        else{
            cart[elem] = 1;
        }
        console.log(cart);
        showCart();
        //добавление в локал сторедж
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    //вспомогательная функция для перебора массива data
    
    function arrayHelper(arr){
        let out = {};
        for(let i = 0; i<arr.length;i++){
            let temp = {};
            temp['articule'] = arr[i]['gsx$articul']['$t'];
            temp['name'] = arr[i]['gsx$name']['$t'];
            temp['cost'] = arr[i]['gsx$category']['$t'];
            temp['cost'] = arr[i]['gsx$cost']['$t'];
            temp['image'] = arr[i]['gsx$image']['$t'];
            out[arr[i]['gsx$id']['$t']] = temp;
        }
        return out;
    }
    
    //вывод корзины
    function showCart(){
        let ul = document.querySelector('.cart');
        ul.innerHTML = '';
        let sum = 0;
        for(let key in cart){
            let li = '<li>';
            li += goods[key]['name'] + ' ';
            //добавление кнопки -
            li += ` <button name="minus-goods" data="${key}">-</button>`;
            li += cart[key] +'шт ';
            //добавление кнопки +
            li += ` <button name="plus-goods" data="${key}">+</button>`;
            li += goods[key]['cost']* cart[key] + '$';
            //добавление кнопки
            li += ` <button name="delete-goods" data="${key}">x</button>`;
            li += '</li>';
            sum += goods[key]['cost']* cart[key];
            ul.innerHTML += li;
        }
        ul.innerHTML += 'Итого:' + sum + '$';
    }
}
    





















//на jQuery
//$(document).ready(function(){
//    $.getJSON("http://spreadsheets.google.com/feeds/list/1IyG8Atb01IMF1w79Mwfc-IVjlEM2M6Bo9-K2BOfWcaw/od6/public/values?alt=json", function(data){
//        data = data ['feed']['entry'];
//        console.log(data);
//        
//        showGoods(data);
//    });
//    
//    function showGoods(data){
//    var out = '';
//    
//    for(var i = 0; i<data.length; i++){
//        if(data[i]['gsx$show']['$t']!=0){
//           
//        out+=`<div class="col-lg-3 col-md3 col-sm2" style="width:200px;
//        margin-bottom:2%;">`;
//        out+=`<div class="goods" style="text-align:center;">`;
//        out+=`<h4>${data[i]['gsx$name']['$t']}</h4>`;
//        out+=`<img src="${data[i]['gsx$image']['$t']}">`;
//        out+=`<h5 class="cost">Цена:${data[i]['gsx$cost']['$t']}</h5>`;
//        out+=`<h5 class="kg">На складе:${data[i]['gsx$kg']['$t']}кг</h5>`;
//        out+=`</div>`;
//        out+=`</div>`;
//        }
//    }
//    $('.shop-field').html(out);
//    }
//})