const request = require('request-promise-native');
const querystring = require('querystring');
const readline = require('readline-sync');

const access_token = '';
let captchaNeeded;
let captchaSid;
let captchaKey;


const faveGetPhotos = () => {
    const postBody = {
        access_token: access_token,
        v: '5.85',
        count: 1000
    };
    const api = 'https://api.vk.com/method/fave.getPhotos';
    const options = {
        url: api,
        body: querystring.stringify(postBody)
    };
    return request.post(options)
        .then(response => {
            const json = JSON.parse(response);
            return json.response;
        })
};

const likesDelete = (owner_id, item_id) => {
    const postBody = {
        access_token: access_token,
        v: '5.85',
        type: 'photo',
        owner_id: owner_id,
        item_id: item_id
    };
    if (captchaNeeded) {
        postBody.captcha_sid = captchaSid;
        postBody.captcha_key = captchaKey;
    }
    const api = 'https://api.vk.com/method/likes.delete';
    const options = {
        url: api,
        body: querystring.stringify(postBody),
    };
    request.post(options)
        .then(response => {
            const json = JSON.parse(response);
            if (json.error !== undefined && json.error.error_code === 14) {
                console.log(`Captcha needed: ${json.error.captcha_img}`);
                captchaNeeded = true;
                captchaSid = json.error.captcha_sid;
                captchaKey = readline.question('Enter Captcha: ');

            } else {
                console.log(json);
                return json.response;
            }
        })
};


const sleep = ms => new Promise(resolve => {
    setTimeout(resolve, ms);
});


const deleteAllLikes = async () => {
    const likedPhotos = await faveGetPhotos();

    let i = 0;
    for (let likedPhoto of likedPhotos.items) {
        await likesDelete(likedPhoto.owner_id, likedPhoto.id);
        await sleep(1000);
        i++;
    }
    console.log(`${i} deleted`);
};



deleteAllLikes();