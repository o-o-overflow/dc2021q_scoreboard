// XXX: I'm scared of touching the existing handling, but
//      this could happen just once on load



export function split_out_special_tags(tags)
{
  // tags -> normal_tags, special_attrs
  //
  // with "--special-key-value" --> special_attrs[key] = value
  //
  // this is icky, but doesn't require changing the db
  // or hardcoding things in javascript
    //
  const normal_tags = tags.split(",")
    .map((tag, index) => { return tag.trim(); })
    .filter((tag) => !tag.startsWith("--"));
  const special_tags = tags.split(",")
    .map((tag, index) => { return tag.trim(); })
    .filter((tag) => tag.startsWith("--"));

  const special_attrs = new Map();
  for (let i = 0; i < special_tags.length; i++) {
    const tag = special_tags[i];
    console.assert(tag.startsWith("--special-"), tag);
    const x = tag.replace("--special-",'').split('-')
    console.assert(x.length === 2, x.length, x);
    const key = x[0].trim(), val = x[1].trim();
    console.assert(!special_attrs.has(key), key, special_attrs);
    special_attrs.set(key, val);
  }

  return [normal_tags, special_attrs];
}


const DEFAULT_EMOJIS = [
    '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😻', '🖖',
    '🧟', '🧞', '👣', '🧳', '🧶', '🥽', '🥼', '💫', '🚌', '🚲',
    '💥', '🐩', '🐕', '🦌', '🦄', '🐹', '🦜', '🎹', '🏵️', '🌸',    
    '🌟', '🌠', '🌫️', '🔥', '✨', '🎋', '🥥', '🏝️', '🏜️', '🏖️',
    '🍇', '🍅', '🥐', '🍔', '🍟', '🍿', '🍙', '🍨', '🍩', '🍰',    
    '🍫', '🍭', '🍺', '🍽️', '🍍', '🥑', '🎪', '🎫', '⚾', '⚽',    
    '🧩', '🎲', '🎷', '🎸', '🎻', '🏹', '💈', '🎏', '🧸', '🧾',    
    '📝', '🚰', '💤', '🃏', '🀄', '🎴', 'xx', '📛', '🔱', '🌋'
];

export function get_emoji(special_attrs, item_index)
{
  if (special_attrs.has('emoji'))  // Use the preset...
    return special_attrs.get('emoji');
  // ... or make one up because we were lazy :(
  return DEFAULT_EMOJIS[item_index % DEFAULT_EMOJIS.length];
}
