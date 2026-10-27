# Interactive Novel / Floria App

// TODO, no story right now

## Writing Guide

### Text Messages

```plaintext
Optional Message Author: Messages and BBCode [i]Rich[/i] Text...
```

```json
{
    "type": "text",
    "author": "Optional Message Author",
    "html": "Messages and BBCode <span style=\"font-style: italic;\">Rich</span> Text..."
}
```

See: https://en.wikipedia.org/wiki/BBCode

```plaintext
`Not a: Author Now, But Still [b]BBCode[/b]
```

```json
{
    "type": "text",
    // "author": undefined
    "html": "Not a: Author Now, But Still <span style=\"font-weight: bold;\">BBCode</span>"
}
```

### Media Messages

```plaintext
`[image] Optional Message Author1: "imageNameInStoryDef"
```

```json
{
    "type": "image",
    "author": "Optional Message Author1", // or undefined if not writing author
    "src": "/path/to/file"
}
```

```plaintext
`[audio] Optional Message Author2: "audioNameInStoryDef"
```

```json
{
    "type": "audio",
    "author": "Optional Message Author2", // or undefined if not writing author
    "src": "/path/to/file"
}
```

```plaintext
`[video] Optional Message Author3: "videoNameInStoryDef"
```

```json
{
    "type": "video",
    "author": "Optional Message Author3", // or undefined if not writing author
    "src": "/path/to/file"
}
```

### Invoke Functions (To Be Implemented)

To use, declare external in your ink script

```plaintext
EXTERNAL invoke(actionName, value)
```

\* Currently, it's a no-op and won't throw, to be implemented if it is proven to be useful.

By design, if you have functions to invoke, declare external and declare your function using it

```plaintext
EXTERNAL invoke(actionName, value)

=== doSomething(someArg1, someArg2) ===
~ invoke("yourHandlerName", "someValues;orOtherStuffs?youDefine")
```

Then add the handler to `packages/renderer/src/views/Splash/async-main-comp.tsx`
