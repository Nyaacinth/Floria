# Floria

Interactive Novel Runner

## How to Write

### Resource File Structure

(Depth = 1, please don't add any subfolders)

your_title_of_novel.zip

- main.json (export of your set of ink script) (please use `include` to compile them into one)
- {your_file_name}.mp3 (sound effects that can be played with `~ playSound("your_file_name")`)
- {your_file_name}.jpg (images to insert in the middle)

### How to Write Ink Script

- [Writing with Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
- [Inky Editor](https://github.com/inkle/inky/releases)

### Additional Features

Play Sound: {name}.mp3

```
EXTERNAL playSound(name)
```

Clear Screen

```
EXTERNAL clear()
```

Shake Screen

```
EXTERNAL shake()
```

Set Background Color

```
VAR background = "<css_color>"
```

Set Background Image: {name}.jpg

```
VAR background = "img:img_name"
```

HTML Rich Text (sanitized)

```
::html::<span>HTML Rich Text</span>
```

Show Image: {name}.jpg

```
::img::img_name
```
