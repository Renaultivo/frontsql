# Front SQL
> Use secure SQL in your front end

## Purpose
> Front SQL make it possible to fetch UI elements (div, span, h1, textarea, etc) by using SQL.

## Why?
>SQL is a realy powerfull language! For sure it is not the most efficiente one, but has a sintaxe that event non-developers can undestand (and I love it). So, why not use it in front-end?

## Runtime Method
> Front SQL is a runtime interpreter/transpiler/compiler. It gets a SQL code, transpile it to javascript and then run it.

## Use Cases
> It can be used by everyone that wants to use SQL to fetch UI elements.

## Examples
> Call the "sql" function with your SQL code. It will return an array (like any SQL operation) containing all found UI Elements that metch your WHERE clauses
### HTML
```html
<body>
  <textarea></textarea>
  <div id="myId" class="test123">Hello, World!</div>
  <div id="myId1" class="test123">Hello, World 1!</div>
  <div id="myId2" class="test123">Hello, World 2!</div>
  <script type="module" src="./assets/js/main.js"></script>
</body>
```

### SQL
```sql
sql(`
  SELECT
    DOCUMENT.ELEMENT.TEXT textContent,
    DOCUMENT.ELEMENT.CLASS itemClass
  FROM
    DOCUMENT.ELEMENT.ELEMENT
  WHERE
    DOCUMENT.ELEMENT.TAG = "div"
`);
```

## Result
```json
[
    {
        "textContent": "Hello, World!",
        "itemClass": "test123"
    },
    {
        "textContent": "Hello, World 1!",
        "itemClass": "test123"
    },
    {
        "textContent": "Hello, World 2!",
        "itemClass": "test123"
    }
]
```

## Open Source Project
> This is a Renaultivo's project, you can use it for free as most of our open source projects. If you have any improvement suggestion, please let us know (or even better: make a pull request).
