var jsonData = data;

// 定義要獲取資料的目標陣列，下含一百個景點物件
var targetArray = jsonData.result.records;
// 定義等等用於篩選器的 array，一開始是全選，所以先等於"targetArray"
var filteredArray = targetArray;

// 選取要塞入觀光景點 html 字串內容的外層容器
var attractionSec = document.getElementById("attractionSec");
// 選取要塞入行政區 html 字串內容的外層容器
var selectArea = document.getElementById("selectArea");

// 選取要監聽的每頁顯示量選單
var selectItemPerPage = document.getElementById("selectItemPerPage");
// 定義每頁可以容納的景點數量(初始值為 10 筆)
var itemPerPage = 10;
// 選取頁碼相關元素
var prev = document.getElementById("prev");
var next = document.getElementById("next");
var pagination = document.getElementById("pagination");

// 定義 pageNum，初始值為 1
var pageNum = 1;

// 取得所有的 Zone，建立新陣列"zoneNameArray"
var zoneNameArray = targetArray.map(function(attractionObj) {
  return attractionObj.Zone;
});

// 篩掉"zoneNameArray"中重複的元素，形成新陣列"uniqueZoneNameArray"
var uniqueZoneNameArray = zoneNameArray.filter(function(name, index) {
  // indexOf(searchValue) 方法，回傳陣列中第一個找到 searchValue 的索引位置
  // e.g. 三民區(0~8)，只有第0個元素回傳 true，即 0 === 0，1 到 8 都是 false
  return zoneNameArray.indexOf(name) === index;
});

// 把新陣列的值選出，塞入 select 元素作為選項
var optionStr = `<option value="tip" disabled selected> -- 請選擇行政區 -- </option>`;
for (let i = 0; i < uniqueZoneNameArray.length; i++) {
  let str = `<option value="${uniqueZoneNameArray[i]}">${uniqueZoneNameArray[i]}</option>`;
  optionStr += str;
}
selectArea.innerHTML = optionStr;

// 塞入觀光景點/主要區域渲染
function renderMain() {
  // 宣告&清空字串內容
  var htmlStr = "";

  // 依照 pageNum 決定顯示陣列
  var displayArray = filteredArray.filter(function(item, index, array) {
    // 偵測篩選陣列長度，當小於或等於每頁顯示量時，顯示陣列直接等於篩選陣列
    if (array.length <= itemPerPage) {
      return true;
    }

    // 當篩選陣列大於每頁顯示量時，須照頁碼找出相對應的顯示陣列
    else {
      // 當元素的位置小於頁碼減一*每頁顯示量，不加入顯示陣列
      if (index < (pageNum - 1) * itemPerPage) {
        return false;
      }
      // 當元素的位置大於頁碼*每頁顯示量，亦不加入顯示陣列
      else if (index >= pageNum * itemPerPage) {
        return false;
      }
      // 剩下都加入顯示陣列
      return true;
    }
  });

  // 將顯示陣列的相關資訊抽出，組成字串準備塞入
  for (let i = 0; i < displayArray.length; i++) {
    let str = `
      <div class="card">
          <div class="card-pic"
              style="background-image: url(${displayArray[i].Picture1});">
              <h3 class="attractionName">${displayArray[i].Name}</h3>
              <p class="locationName">${displayArray[i].Zone}</p>
          </div>
          <div class="card-info">
              <ul>
                  <li><img src="./img/icons_clock.png" alt="clock icon">${displayArray[i].Opentime}</li>
                  <li><img src="./img/icons_pin.png" alt="pin icon">${displayArray[i].Add}</li>
                  <li><img src="./img/icons_phone.png" alt="phone icon">${displayArray[i].Tel}</li>
              </ul>
              <p><img src="./img/icons_tag.png" alt="tag icon">${displayArray[i].Ticketinfo}</p>
          </div>
      </div>
      `;
    htmlStr += str;
  }
  // 塞入
  attractionSec.innerHTML = htmlStr;
  pagination.textContent = pageNum;

  // 依照頁碼，決定 prev, next 的渲染狀況
  // 頁碼等於 1 時，上一頁轉為透明顯示
  if (pageNum == 1) {
    prev.setAttribute("class", "disabled-color");
  } else {
    prev.removeAttribute("class", "disabled-color");
  }
  // 頁碼大於"最後一頁"時，下一頁轉為透明顯示
  // ※ 原為大於等於 Math.floor(filteredArray.length / itemPerPage)，但會在切換區域時產生錯誤
  // 即第一頁就符合條件，因此改成只有頁碼大於時才成立，減一是為了處理剛好整除的狀況
  // e.g. floor(100/10) 等於 10，但已經是最後一頁
  if (pageNum > Math.floor((filteredArray.length - 1) / itemPerPage)) {
    next.setAttribute("class", "disabled-color");
  } else {
    next.removeAttribute("class", "disabled-color");
  }
  // console.log(
  //   "pageNum: " + pageNum,
  //   "最後一頁:" + Math.floor(filteredArray.length / itemPerPage)
  // );
}
renderMain();

var areaTitle = document.getElementById("areaTitle");
selectArea.addEventListener("change", function() {
  // zoneName 為使用者選取的行政區
  let zoneName = selectArea.value;
  // 切換標題文字
  areaTitle.textContent = zoneName;

  // 從 targetArray 中篩選出新陣列
  filteredArray = targetArray.filter(function(attractionObj) {
    if (attractionObj.Zone === zoneName) {
      return true;
    }
  });

  // 設定頁碼為1，避免多頁面跳回少頁面出錯
  // 規定切區域一定要從第一頁開始
  pageNum = 1;

  // 重新渲染頁面
  renderMain();
});

// 頁碼增減
prev.addEventListener("click", function() {
  // 頁碼不可小於 1
  if (pageNum > 1) {
    pageNum -= 1;
  }
  renderMain();
});
next.addEventListener("click", function() {
  // 頁碼不可超過 "陣列項目數除以每頁顯示數"
  if (pageNum < filteredArray.length / itemPerPage) {
    pageNum += 1;
  }
  renderMain();
});

// 切換每頁顯示筆數
selectItemPerPage.addEventListener("change", function() {
  itemPerPage = Number(selectItemPerPage.value);
  pageNum = 1;
  renderMain();
});

// 選取熱門行政區
var btn1st = document.querySelector(".btn-1st");
var btn2nd = document.querySelector(".btn-2nd");
var btn3rd = document.querySelector(".btn-3rd");
var btn4th = document.querySelector(".btn-4th");

// 四個監聽器，重新 render 主畫面
btn1st.addEventListener("click", () => {
  areaTitle.textContent = btn1st.textContent;
  filteredArray = targetArray.filter(function(attractionObj) {
    if (attractionObj.Zone === btn1st.textContent) {
      return true;
    }
  });
  pageNum = 1;
  renderMain();
});

btn2nd.addEventListener("click", () => {
  areaTitle.textContent = btn2nd.textContent;
  filteredArray = targetArray.filter(function(attractionObj) {
    if (attractionObj.Zone === btn2nd.textContent) {
      return true;
    }
  });
  pageNum = 1;
  renderMain();
});

btn3rd.addEventListener("click", () => {
  areaTitle.textContent = btn3rd.textContent;
  filteredArray = targetArray.filter(function(attractionObj) {
    if (attractionObj.Zone === btn3rd.textContent) {
      return true;
    }
  });
  pageNum = 1;
  renderMain();
});

btn4th.addEventListener("click", () => {
  areaTitle.textContent = btn4th.textContent;
  filteredArray = targetArray.filter(function(attractionObj) {
    if (attractionObj.Zone === btn4th.textContent) {
      return true;
    }
  });
  pageNum = 1;
  renderMain();
});
