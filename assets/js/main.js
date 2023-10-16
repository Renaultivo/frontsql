import { SQLParser } from "./SQLParser.js";

(() => {

  const textarea = document.getElementsByTagName('textarea')[0];

  if (!textarea) {
    console.log('[failed]: unable to load textarea element');
    return;
  }
  
  fetch('./assets/samples/code1.sql').then((response) => {

    response.text().then((code) => {

      console.log(new SQLParser().parse(code));

    });

  });

  window.sql = (code) => {

    return new SQLParser().parse(code);

  }

})();