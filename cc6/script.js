// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#________'
    this.update = this.update.bind(this)
  }
  setText(newText) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }
  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

const phrases = [
  'ㅤㅤ',
  'ㅤㅤㅤㅤㅤㅤ',
  'ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ',
  '「ㅤNO GAMEㅤNO LIFEㅤ」',
  '十六種族 =イクシード=',
  '位階序列一位ㅤ=神霊種【オールドデウス】=',
  '位階序列二位ㅤ=幻想種【ファンタズマ】=',
  '位階序列三位ㅤ=精霊種【エレメンタル】=',
  '位階序列四位ㅤ=龍精種【ドラゴニア】=',
  '位階序列五位ㅤ=巨人種【ギガント】=',
  '位階序列六位ㅤ=天翼種【フリューゲル】=',
  '位階序列七位ㅤ=森精種【エルフ】=',
  '位階序列八位ㅤ=地精種【ドワーフ】=',
  '位階序列九位ㅤ=妖精種【フェアリー】=',
  '位階序列十位ㅤ=ㅤ=機凱種【エクスマキナ】=',
  '位階序列十一位ㅤ=妖魔種【デモニア】=',
  '位階序列十二位ㅤ=吸血種【ダンピール】=',
  '位階序列十三位ㅤ=月詠種【ルナマナ】=',
  '位階序列十四位ㅤ=獣人種【ワービースト】=',
  '位階序列十五位ㅤ=海棲種【セーレーン】=',
  '位階序列十六位ㅤ=人類種【イマニティ】=',
  ' ',
  'ㅤㅤ',
  '十の盟約',
  '【一つ】この世界におけるあらゆる殺傷、戦争、略奪を禁ずる',
  '【二つ】争いは全てゲームにおける勝敗で解決するものとする',
  '【三つ】ゲームには、相互が対等と判断したものを賭けて行われる',
  '【四つ】"三"に反しない限り、ゲーム内容、賭けるものは一切を問わない',
  '【五つ】ゲームの内容は、挑まれた方が決定権を有する',
  '【六つ】"盟約に誓って"行われた賭けは、絶対順守される',
  '【七つ】集団における争いは、全権代理者をたてるものとする',
  '【八つ】ゲーム中の不正発覚は、敗北と見なす',
  '【九つ】以上をもって神の名のもと絶対不変のルールとする',
  '【十】みんななかよくプレイしましょう',
  'ㅤㅤ',
  ' '
]

const el = document.querySelector('.text')
const fx = new TextScramble(el)

let counter = 0
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 3000)
  })
  counter = (counter + 1) % phrases.length
}

next()