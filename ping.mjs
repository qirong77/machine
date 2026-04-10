// 在客户端ping API
fetch('https://api.qirong77.com').then(res => res.text()).then(data => {
    console.log(data);
}).catch(err => {
    console.error(err.message);
});