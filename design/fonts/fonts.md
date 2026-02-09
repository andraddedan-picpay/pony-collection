# Import ways

## Embed code in the <head> of your html

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Big+Shoulders+Inline:opsz,wght@10..72,100..900&display=swap"
  rel="stylesheet"
/>
```

OR

```html
<style>
@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Big+Shoulders+Inline:opsz,wght@10..72,100..900&display=swap');
</style>
```

---

# CSS Styles

## Barlow: CSS classes

```css
.barlow-thin {
  font-family: "Barlow", sans-serif;
  font-weight: 100;
  font-style: normal;
}

.barlow-extralight {
  font-family: "Barlow", sans-serif;
  font-weight: 200;
  font-style: normal;
}

.barlow-light {
  font-family: "Barlow", sans-serif;
  font-weight: 300;
  font-style: normal;
}

.barlow-regular {
  font-family: "Barlow", sans-serif;
  font-weight: 400;
  font-style: normal;
}

.barlow-medium {
  font-family: "Barlow", sans-serif;
  font-weight: 500;
  font-style: normal;
}

.barlow-semibold {
  font-family: "Barlow", sans-serif;
  font-weight: 600;
  font-style: normal;
}

.barlow-bold {
  font-family: "Barlow", sans-serif;
  font-weight: 700;
  font-style: normal;
}

.barlow-extrabold {
  font-family: "Barlow", sans-serif;
  font-weight: 800;
  font-style: normal;
}

.barlow-black {
  font-family: "Barlow", sans-serif;
  font-weight: 900;
  font-style: normal;
}

.barlow-thin-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 100;
  font-style: italic;
}

.barlow-extralight-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 200;
  font-style: italic;
}

.barlow-light-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 300;
  font-style: italic;
}

.barlow-regular-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 400;
  font-style: italic;
}

.barlow-medium-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 500;
  font-style: italic;
}

.barlow-semibold-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 600;
  font-style: italic;
}

.barlow-bold-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 700;
  font-style: italic;
}

.barlow-extrabold-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 800;
  font-style: italic;
}

.barlow-black-italic {
  font-family: "Barlow", sans-serif;
  font-weight: 900;
  font-style: italic;
}
```

## Big Shoulders Inline: CSS class for a variable style

```css
// <weight>: Use a value from 100 to 900
// <uniquifier>: Use a unique and descriptive class name

.big-shoulders-inline-<uniquifier> {
  font-family: "Big Shoulders Inline", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
}
```
