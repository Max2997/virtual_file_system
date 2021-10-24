$(document).on("ready", () => {
  const regData = /\[([^*]+)\]/; // regex get data inside []
  const regGroupData = /\[([^\]]+)\]/g; // regex get group data inside []

  let faviconnumber = 1;
  function favicon() {
    favicon = favicon == 1 ? 2 : 1;
    $(".favicon").attr("href", "favicon" + favicon + ".png");
  }
  console.clear();
  let commandlist = [
    ["/help: Show commands"],
    ["/clear: Clear the console"],
    ["-------------------------------------------------------------------------------------------"],
    ["* aliases: "],
    ["** . (dot): current working folder "],
    ["** .. (double dots): parent folder"],
    ["** / (slash): root folder"],
    ["-------------------------------------------------------------------------------------------"],
    ["* cd FOLDER_PATH: change current working directory/folder to the specified FOLDER"],
    ["-------------------------------------------------------------------------------------------"],
    ["* ls [FOLDER_PATH]: list out all items directly under a folder"],
    ["-------------------------------------------------------------------------------------------"],
    ["* cd [FOLDER_PATH]: change current working directory/folder t o the specified FOLDER"],
    ["-------------------------------------------------------------------------------------------"],
    ["* cr [-p] PATH [DATA]: create a new file (if DATA is specified, otherwise create a new folder) at the specified PATH"],
    ["** option -p: create the missing parent folder"],
    ["** example: cr -p path/of/folder [Lorem ipsum]"],
    ["-------------------------------------------------------------------------------------------"],
    ["* cat FILE_PATH: show the content of a file at FILE_PATH. If there is no file at FILE_PATH, raise error."],
    ["-------------------------------------------------------------------------------------------"],
    ["* find NAME [FOLDER_PATH]: search all files/folders whose name contains the substring NAME."],
    ["** If the optional param FOLDER_PATH is specified, find in the folder at FOLDER_PATH. Otherwise if omitted, find in the current working folder."],
    ["** example: find name file [path / of / folder]"],
    ["-------------------------------------------------------------------------------------------"],
    ["* up PATH <NAME> [DATA]: update the file/folder at PATH to have new NAME and, optionally, new DATA"],
    ["** example: up path/ of / item <new name> [data of file]"],
    ["-------------------------------------------------------------------------------------------"],
    ["* mv [PATH] [FOLDER_PATH]: move a file/folder at PATH into the destination FOLDER_PATH"],
    ["** example: mv [path/of/item] [path/of/destination]"],
    ["-------------------------------------------------------------------------------------------"],
    ["* rm [PATH] [PATH2] [PATH3] .....: remove files/folders at the specified PATH(s)"],
    ["** example: rm [path / of /item 1] [path / of /item 2] [path / of /item 3]"]
  ];
  let previouscommands = [];
  let currentcommand = 0;

  function init() {
    setInterval(time);
    console.clear();
    console.log(new Date().getTime());
    log("Client", "For help say '/help'");
    setInterval(favicon, 500);
  }

  function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regexS = "[\\?&]" + name + "=([^&#]*)";
    let regex = new RegExp(regexS);
    let results = regex.exec(window.location.href);
    if (results == null) {
      return "";
    } else {
      return results[1];
    }
  }

  function log(name, information) {
    let currentWorking = $('.editline')[0].dataset.currentWorking;
    let d = new Date();
    let hours = (d.getHours() < 10 ? "0" : "") + d.getHours();
    let minutes = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    let seconds = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
    let colour = "whitet";
    let textcolour = "";
    let postcolour = "";

    switch (name[0]) {
      case "!":
        postcolour = " important";
        name = name.substr(1);
        break;
    }
    switch (name) {
      case "Error":
        colour = "redt";
        break;
      case "Server":
        colour = "bluet";
        break;
      case "Client":
        colour = "bluet";
        break;
      case "User":
        colour = "greent";
        postcolour = " selft";
        break;
    }
    $(".stream").append(
      `
        <div class="line">
          <p class="time">[${hours}:${minutes}:${seconds}]</p>
          <p class="current-working redt">/${currentWorking}</p>
          <p class="name ${colour}">${name}</p>
          <p class="information ${postcolour}">${escapeHtml(information)}</p>
        </div>
      `
    );
    $(document).scrollTop($(document).height() - $(window).height());
  }
  let timestring = "";
  function time() {
    let d = new Date();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let seconds = d.getSeconds();
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    let temptimestring = "[" + hours + ":" + minutes + ":" + seconds + "]";
    if (temptimestring != timestring) {
      timestring = temptimestring;
      $(".editline .time").text(timestring);
    }
  }

  let ctrldown = false;
  $(".editline .edit").keydown(function (e) {
    let text = $(".editline .edit")[0].value;
    if (e.which == 13 && text !== "" && !ctrldown) {
      let commands = text.split(" ");
      let output = "";
      if (commands[0] == "help") {
        text = "/" + text;
      }
      $(".editline .edit")[0].value = "";
      log("User", text);

      previouscommands[currentcommand] = text;
      currentcommand = previouscommands.length;
      $(".editline .edit").keydown(35);
      cmd(commands[0], text.trim(), commands);
    }
    if (e.which == 38) {
      //up
      if (currentcommand > 0) {
        currentcommand--;
        $(".editline .edit")[0].value = previouscommands[currentcommand] || "";
      }
    }
    if (e.which == 40) {
      //down

      if (currentcommand < previouscommands.length) {
        currentcommand++;
        $(".editline .edit")[0].value = previouscommands[currentcommand] || "";
      }
    }
  });

  function cmd(command, words, word) {
    switch (word[0]) {
      case "/help":
      case "help":
        for (let i = 0; i < commandlist.length; i++) {
          log(i === 0 ? 'Client' : '', commandlist[i][0]);
        }
        break;
      case "/clear":
        $(".stream").text("");
        break;
      case "ls":
        handleLsCommand(command, word);
        break;
      case "cd":
        handleCdCommand(command, word);
        break;
      case "cr":
        handleCrCommand(command, word, words);
        break;
      case "cat":
        handleCatCommand(command, word);
        break;
      case "find":
        handleFindCommand(command, word, words);
        break;
      case "up":
        handleUpCommand(command, word, words);
        break;
      case "mv":
        handleMvCommand(command, word, words);
        break;
      case "rm":
        handleRmCommand(command, word, words);
        break;
      default:
        output = "command not found: " + word[0];
        log("Client", output);
    }
  }

  String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };
  init();

  function handleLsCommand(command, word) {
    let path = word.slice(1).join(' ');
    loading(true)
    $.ajax({
      url: '/items',
      method: "get",
      data: { path: path },
      success: function(res){
        loading(false)
        log('Server', `Total: ${res.meta.size}`)
        renderItems(res.items)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleCdCommand(command, word) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: ${word[2]}: No such file or directory`);
    }

    let path = word.slice(1).join(' ');
    loading(true)
    $.ajax({
      url: '/items/set_current_working',
      method: "get",
      data: { path: path },
      success: function(res){
        loading(false)
        $('.editline')[0].dataset.currentWorking = res.name;
        $('.editline .current-working').text(`/${res.name}`)
        log('Server', `Your current working directory/folder is ${res.name}`);
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleCrCommand(command, word, words) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    let matchData = words.match(regData);
    let data;
    let pathText;

    if (matchData) {
      data = matchData[1]
      if(words.endsWith(matchData[0])) {
        pathText = words.split(matchData[0])[0].trim()
      } else {
        return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
      }
    }

    // check have option -p
    let flag = false;
    let arrWord = pathText ? pathText.split(' ') : word;
    let path;
    if( arrWord[1] == "-p" ) {
      flag = true;
      path = arrWord.slice(2).join(' ')
    } else {
      path = arrWord.slice(1).join(' ')
    }

    loading(true)

    $.ajax({
      url: '/items',
      method: "post",
      data: { path: path, flag: flag, data: data },
      success: function(res){
        loading(false)
        log('Server', `${res.name} was created successfull!`)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleCatCommand(command, word) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: ${word[2]}: No such file or directory`);
    }

    let path = word.slice(1).join(' ');

    loading(true)

    $.ajax({
      url: '/items/cat_detail',
      method: "get",
      data: { path: path },
      success: function(res){
        loading(false)
        let item = res.item;
        let meta = res.meta;
        log('Server', `The content of a file "${item.name}" (size: ${item.size}):`);
        log('', meta.data);
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleFindCommand(command, word, words) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    let matchPath = words.match(regData);
    let path;
    let pathText;
    if (matchPath) {
      path = matchPath[1]
      if(words.endsWith(matchPath[0])) {
        pathText = words.split(matchPath[0])[0].trim()
      } else {
        return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
      }
    }
    let arrWord = pathText ? pathText.split(' ') : word;

    let name = arrWord.slice(1).join(' ')

    loading(true)

    $.ajax({
      url: '/items/find',
      method: "get",
      data: { path: path, name: name },
      success: function(res){
        loading(false)
        log('Server', `Have ${res.length} items was found:`);
        renderItemsWithPath(res)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleUpCommand(command, word, words) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    let matchData = words.match(regData);
    let data;
    let name;
    let pathText = words;
    // get [data]

    if (matchData) {
      data = matchData[1]
      if(pathText.endsWith(matchData[0])) {
        pathText = pathText.split(matchData[0])[0].trim()
      } else {
        return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
      }
    }

    // get <name>
    const regName = /\<([^*]+)\>/; // regex get name inside <>
    let matchName = pathText.match(regName)
    if (matchName) {
      name = matchName[1]
      if(pathText.endsWith(matchName[0])) {
        pathText = pathText.split(matchName[0])[0].trim()
      } else {
        return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
      }
    } else {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    // split get path
    let arrWord = pathText.split(' ');

    let path = arrWord.slice(1).join(' ')

    loading(true)

    $.ajax({
      url: '/items/update_item',
      method: "put",
      data: { path: path, name: name, data: data },
      success: function(res){
        loading(false)
        log('Server', `${res.name} was updated successfull!`)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleMvCommand(command, word, words) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    let matchPath = words.match(regGroupData);
    let arrPath = [];
    for (let i = 0; i < matchPath.length; i++) {
      let str = matchPath[i];
      arrPath.push(str.substring(1, str.length - 1))
    }

    if(arrPath.length != 2 || words.replace(regGroupData, '').trim() != 'mv') {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    loading(true)

    $.ajax({
      url: '/items/move',
      method: "put",
      data: { path: arrPath[0], path_destination: arrPath[1] },
      success: function(res){
        loading(false)
        log('Server', `"${res.name}" was moved to "${arrPath[1]}"`)
        log('', `New path of item is: ${res.path_name}`)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function handleRmCommand(command, word, words) {
    if ( word.length < 2 ) {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    let matchPath = words.match(regGroupData);
    let arrPath = [];
    if (matchPath) {
      for (let i = 0; i < matchPath.length; i++) {
        let str = matchPath[i];
        arrPath.push(str.substring(1, str.length - 1))
      }
    } else {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    if(arrPath.length == 0 || words.replace(regGroupData, '').trim() != 'rm') {
      return log("Error", `${command}: The command was wrong format. Say help to see example in /help.`);
    }

    loading(true)

    $.ajax({
      url: '/items/remove',
      method: "delete",
      data: { paths: arrPath },
      success: function(res){
        loading(false)
        res.data.map(renderRmLog)
        $('.editline')[0].dataset.currentWorking = res.current_working;
        $('.editline .current-working').text(`/${res.current_working}`)
      },
      error: function(res) {
        loading(false)
        log('Error', res.responseJSON.error)
      }
    })
  }

  function renderItems(items) {
    log('', `Index - Name - Created At - Size - Type`)
    items.map((item, index) => renderItem(item, index + 1))
  }

  function renderItemsWithPath(items) {
    log('', `Index - Name - Created At - Type - Path`)
    items.map((item, index) => {
      log('', `${index + 1} - ${item.name} - ${item.created_at} - ${item.kind} - ${item.path_name}`)
    })
  }

  function renderItem(item, index) {
    log('', `${index} - ${item.name} - ${item.created_at} - ${item.size} - ${item.kind}`)
  }

  function renderRmLog(obj) {
    Object.keys(obj).map( key => {
      if(obj[key]) {
        log('', `The item at ${key} was removed successful!`)
      } else {
        log("Error", `rm: ${key}: No such file or directory`);
      }
    })
  }

  function loading(flag) {
    if (flag) {
      log('Server', 'Loading ... ')
    } else {
      log('Server', 'Done ... ')
    }
  }
});

window.onclick = e => {
  const body = document.querySelector('body')
  const input = document.querySelector('body input.edit');
  if(!body.contains(e.target)) {
    input.focus();
  }
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
