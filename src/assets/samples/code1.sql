
SELECT
  DOCUMENT.ELEMENT.TEXT value,
  DOCUMENT.ELEMENT.CLASS className,
  DOCUMENT.ELEMENT.ID elementID,
  DOCUMENT.ELEMENT.ELEMENT root
FROM
  DOCUMENT.ELEMENT
WHERE
  DOCUMENT.ELEMENT.ID = 'myId';
