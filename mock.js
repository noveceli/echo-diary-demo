/* =========================================================
   回声日记 v0.1 · mock data & stubbed API
   All content is preset demo data. No real backend / model call.
   ========================================================= */
(function () {
  const DEMO_NOW = "2026-10-27T21:48:00+08:00";
  const TODAY_KEY = "2026-10-27";

  // 2026 年 10 月 · 农历与节气（按参考截图整理，用于静态演示）
  const OCT_LUNAR = {
    1: "国庆节", 2: "廿二", 3: "廿三", 4: "廿四", 5: "廿五", 6: "廿六", 7: "廿七",
    8: "寒露", 9: "廿九", 10: "九月", 11: "初二", 12: "初三", 13: "初四", 14: "初五",
    15: "初六", 16: "初七", 17: "初八", 18: "重阳", 19: "初十", 20: "十一", 21: "十二",
    22: "十三", 23: "霜降", 24: "十五", 25: "十六", 26: "十七", 27: "十八", 28: "十九",
    29: "二十", 30: "廿一", 31: "万圣节"
  };
  const HOLIDAYS = [1, 8, 18, 23, 31];
  const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  // 初始时间线：今天（10-27）刻意留空，让用户完成「写」这一步
  const ENTRIES = [
    {
      id: "e-2026-10-26",
      date: "2026-10-26",
      time: "21:47",
      text: "加班到九点，楼下便利店只剩最后一碗关东煮。萝卜煮得很软，汤是热的。坐在店门口的高脚凳上吃完，抬头看见对面楼里还有几盏灯亮着。",
      echoNote: "昨天你写到那碗关东煮。忙乱的一天里，至少有一口是热的。"
    },
    {
      id: "e-2026-10-21",
      date: "2026-10-21",
      time: "12:38",
      text: "午饭一个人吃，点了常去的那家番茄鸡蛋面。老板娘还记得我不吃香菜，端上来的时候特意说了一句。面有点咸，但我还是吃完了。",
      echoNote: "你写到老板娘记得你不吃香菜。被记住的感觉，往往藏在这种小事里。"
    },
    {
      id: "e-2026-10-14",
      date: "2026-10-14",
      time: "21:02",
      text: "下班没有直接回家，绕到河边走了一圈。风把水面吹得一层一层，像有人在很轻地翻书。走到桥下的时候，忽然觉得今天也没有那么糟。",
      echoNote: "你说河边的风像有人在很轻地翻书。那天你没有赶路，只是走了一会儿。",
      media: [
        { type: "art", key: "river-wind", title: "河边的风" },
        { type: "gif", key: "ripple", title: "水面的涟漪" }
      ]
    },
    {
      id: "e-2026-10-08",
      date: "2026-10-08",
      time: "22:14",
      text: "假期最后一天，把房间从里到外收拾了一遍。在抽屉最里面翻到一张去年秋天的车票，边角已经卷了。没舍得扔，又放回去了。",
      echoNote: "你翻到一张旧车票，又放了回去。不是所有东西都要丢掉，留一点来路也挺好。"
    },
    {
      id: "e-2026-10-03",
      date: "2026-10-03",
      time: "19:26",
      text: "和朋友去江边看日落。太阳掉下去的那几分钟，谁都没有说话。风把她的头发吹得乱七八糟，她也不管，只说「这样挺好的」。回来的路上买了两支冰棍，一支化得很快。",
      echoNote: "你说日落那几分钟谁都没说话。有些安静，比聊天更像在陪一个人。",
      media: [
        { type: "art", key: "sunset", title: "江边日落" },
        { type: "video", url: "https://www.bilibili.com/video/BV1GJ411x7h7", title: "江边日落的几分钟" }
      ]
    }
  ];

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* -------------------- stubbed API --------------------
     TODO: 微信云开发 · 云数据库 collection(diaries)
     GET  /diaries            -> { list: Entry[] }
     POST /diaries            -> { entry: Entry }
     TODO: 豆包大模型 · POST /ai/chat -> { reply: string }
  ------------------------------------------------------ */
  const EchoAPI = {
    async fetchEntries() {
      await wait(100);
      return { list: deepClone(ENTRIES) };
    },

    async saveDiary({ id, date, time, text, media }) {
      await wait(320);
      return {
        entry: {
          id: id || "e-" + date,
          date,
          time,
          text: text.trim(),
          echoNote: "",
          media: deepClone(media || [])
        }
      };
    },

    async askEcho(payload) {
      await wait(620);
      // 原型阶段由本地预设脚本回复，不调用真实模型
      return { reply: payload && payload.fallback ? payload.fallback : "" };
    }
  };

  window.EchoMock = {
    DEMO_NOW,
    TODAY_KEY,
    OCT_LUNAR,
    HOLIDAYS,
    WEEKDAYS,
    ENTRIES,
    deepClone,
    wait
  };
  window.EchoAPI = EchoAPI;
})();
