const node_kakao = require("node-kakao");
const client = new node_kakao.TalkClient("COMPUTER NAME", "DEVICE UUID");
const banWord = ["매도", "매수", "리딩", "주식", "주가", "급등주", "상한가", "수익", "투자", "입장하기", "open.kakao.com", "/o/g", "오픈채팅방 배포/가리기봇"];

client.login("EMAIL OR PHONE NUMBER", "PASSWORD").then(() => {
	console.log("[+] - Login in successfully.");
}).catch((error) => {
    console.error("[!] - Login failed.\nResult JSON: " + JSON.stringify(error, null, 2));
    process.exit(1);
});

client.on("message", (chat) => {
    banWord.map((e) => {
        if (JSON.stringify(chat.rawAttachment).includes(e) || chat.Text.includes(e)) {
            chat.hide();
            client.OpenLinkManager.kickMember(chat.channel, chat.sender.id);
            chat.replyText("F - U - C - K - I - N - G - S - P - A - M");
            break;
        }
    })
});
