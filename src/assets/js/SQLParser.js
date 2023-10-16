
const TYPES = {
  select: {
    type: 'select',
    path: {
      document: {
        element: {
          id: (elementName, index) => { return `${elementName}${index != null ? `[${index}]` : ''}.id`; },
          text: (elementName, index) => { return `${elementName}${index != null ? `[${index}]` : ''}.innerText`; },
          class: (elementName, index) => { return `${elementName}${index != null ? `[${index}]` : ''}.className`; },
          element: (elementName, index) => { return `${elementName}${index != null ? `[${index}]` : ''}` }
        }
      }
    }
  },
  from: {
    type: 'from'
  },
  where: {
    type: 'where',
    path: {
      document: {
        element: {
          id: (id) => { return { query: `document.getElementById("${id}")`, type: 'single' }; },
          class: (className) => { return { query: `document.getElementsByClassName("${className}")`, type: 'multiple' }; },
          tag: (tag) => { return { query: `document.getElementsByTagName("${tag}")`, type: 'multiple' }; },
        }
      }
    }
  }
};

export class SQLParser {

  #code = null;

  constructor() {

    this.clauses = {
      select: (data, elements) =>  {

        let args = data.args;
        let lines = new Array();


        elements.forEach((elementName) => {

          if (elementName.indexOf('List') != -1) {

            lines.push(
`(() => {

  let obj = '';

  for (let x=0; x<${elementName}.length; x++) {

    let args = ["${args.join('","')}"];

    obj += '{';

    args.forEach((arg) => {

      arg = arg.replaceAll(';', '');

      let [path, alias] = arg.split(/\\s/);

      if (!alias) {
        obj += \`\${path.split('.').pop()}: \${eval(\`TYPES.select.path.\${path.toLowerCase()}("${elementName}", \${x})\`)},\`;
      } else {
        obj += \`\${alias}: \${eval(\`TYPES.select.path.\${path.toLowerCase()}("${elementName}", \${x})\`)},\`;
      }

    });

    obj = obj.substring(0, obj.length-1);
    obj += '},';

  }

  return eval(\`([\${obj.substring(0, obj.length-1)}])\`);

})()`)


          } else {

            
            let obj = '{';

            args.forEach((arg) => {

              arg = arg.replaceAll(';', '');
              
              let [path, alias] = arg.split(/\s/);

              try {
                
                if (!alias) {
                  obj += `${path.split('.').pop()}: ${eval(`TYPES.select.path.${path.toLowerCase()}("${elementName}")`)},`;
                } else {
                  obj += `${alias}: ${eval(`TYPES.select.path.${path.toLowerCase()}("${elementName}")`)},`;
                }

              } catch(error) {
                console.log(`%c#SQL ERROR# -> [unknow-prop]: ${path} is not a valid property name!`, 'color: #eb3461');
                return;
              }

            });

            obj = obj.substring(0, obj.length-1);

            obj += '}'

            lines.push(obj);

          }


        });

        return lines;

      },
      from: () => {

      },
      where: (data) =>  {

        let args = data.args;

        let lines = new Array();

        args.join(' ').split(/(and|AND)/gm).forEach((arg) => {

          arg = arg.replaceAll(';', '');

          let command = arg.split('=').map((item) => { return item.trim(); });

          lines.push(eval(`TYPES.where.path.${command[0].toLowerCase()}(${command[1]})`));

        });

        return lines;

      }
    };

  }

  getClauseArgs(code, index) {

    let args = new Array();

    let accumulator = '';

    for (; index<code.length; index++) {

      if ((/(\s|\,|\n)/gm).test(code[index])) {

        if (accumulator != '') {
          args.push(accumulator);
          accumulator = '';
        }

        continue;

      }

      accumulator += code[index];

      if (this.clauses[accumulator.toLowerCase()]) {
        index -= (accumulator.length+1);
        accumulator = '';
        break;
      }

    }

    if (accumulator != '') {
      args.push(accumulator);
    }

    let finalArgList = new Array();

    for (let x=0; x<args.length; x++) {

      if (args[x].indexOf('.') <= -1) {
        finalArgList[finalArgList.length-1] = finalArgList[finalArgList.length-1] + ' ' + args[x];
      } else {
        finalArgList.push(args[x]);
      }

    }

    return {
      index,
      args: finalArgList
    }

  }

  parse(origninalCode) {
    this.#code = origninalCode.trim().replaceAll('\n', ' ');

    let code = this.#code;

    let tokens = new Array();
    let accumulator = '';

    for (let i=0; i<code.length; i++) {

      if (code[i].trim().length <= 0) {
        continue;
      }

      accumulator += code[i];

      if (this.clauses[accumulator.toLowerCase()]) {

        let args = this.getClauseArgs(code, i+1);

        tokens.push(Object.assign(TYPES[accumulator.toLowerCase()], {
          args: args.args
        }));

        i = args.index+1;
        accumulator = '';

      }

    }

    return this.#transpile(tokens);

  }

  #transpile(tokens) {

    let data = new Array(tokens.length).fill(new Object()).reduce((obj, item, index) => {
      obj[tokens[index-1].type] = tokens[index-1];
      return obj;
    });

    data[tokens[tokens.length-1].type] = tokens[tokens.length-1];

    let elements = new Array();

    let header = this.clauses.where(data['where']).map((item, index) => {

      if (item.type == 'single') {

        const elementName = `element${index}`;
        elements.push(elementName);
  
        return `const ${elementName} = ${item.query};`;

      } else {
        
        const elementName = `elementList${index}`;
        elements.push(elementName);
  
        return `const ${elementName} = ${item.query};`;

      }


    }).join('\n\t');

    let body = '.concat(' + this.clauses.select(data['select'], elements).join(').concat(') + ')';

    let code =
`(() => {

  ${header}
  
  let result = new Array();

  result = result${body};

  return result;

})();`;

    return eval(code);

  }

};

