// https://twitter.com/WHlamei/status/1757274267736293598

const power = {
  3: 1, 4: 2, 5: 3, 6: 4,
  7: 5, 8: 6, 9: 7, 0: 8,
  A: 9, J: 10, Q: 11, K: 12,
  2: 13, W: 14,
}

// 根据手里的牌和上一轮出的牌，得出本轮出牌的所有选择。
function getChoices(cards, prev) {
  let choices = []
  if (prev.length > 0) {
    // 上一轮有出牌，本轮可以选择不出牌
    choices.push('')
  }
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i]
    let choice = ''
    // 可以出单张牌，或者多张相同的牌
    for (let j = i; j < cards.length; j++) {
      if (cards[j] !== card) break
      choice += card
      if (prev.length == 0) {
        // 上一轮没有出牌，本轮可以任意出牌
        choices.push(choice)
      } else if (choice.length == prev.length && power[choice[0]] > power[prev[0]]) {
        // 上一轮有出牌，本轮只能出相同张数更大的牌
        choices.push(choice)
      }
      i = j
    }
  }
  return choices
}

class Table {
  a = '' // 我方手里的牌
  b = '' // 对方手里的牌
  prev = '' // 上一轮出的牌
  isMyTurn = true // true 表示该我方出牌
  constructor(a, b, prev = '', isMyTurn = true) {
    this.a = a
    this.b = b
    this.prev = prev
    this.isMyTurn = isMyTurn
  }

  // 从当前牌桌状态开始出牌。
  // 如果最终结局是“我方赢”，则返回赢牌的方案路径，否则返回 false。
  play() {
    if (this.isMyTurn) {
      let choices = getChoices(this.a, this.prev)
      for (let choice of choices) {
        let leftCards = this.a.replace(choice, '')
        if (leftCards.length == 0) {
          // 我方牌已出光，我方赢
          return [`(${choice})`]
        }
        let nextTable = new Table(leftCards, this.b, choice, false)
        let win = nextTable.play()
        // 只要有一种出牌法是我方赢，则本桌为“我方赢”
        if (win) {
          win.unshift(`(${choice})`)
          return win
        }
      }
      // 当我方出牌时，如果所有可选择的出牌法都是“我方输”，则本桌为“我方输”
      return false
    } else {
      let choices = getChoices(this.b, this.prev)
      let wins = []
      for (let choice of choices) {
        let leftCards = this.b.replace(choice, '')
        if (leftCards.length == 0) {
          // 对方牌已出光，我方输
          return false
        }
        let nextTable = new Table(this.a, leftCards, choice, true)
        let win = nextTable.play()
        // 只要有一种出牌法是我方输，则本桌为“我方输”
        if (!win) {
          return false
        }
        win.unshift(`<${choice}>`)
        wins.push(win)
      }
      // 当对方出牌时，如果所有可选择的出牌法都是“我方赢”，则本桌为“我方赢”
      return wins
    }
  }
}

let t = new Table('WAAJJ99', 'K22')
let win = t.play()
console.log(JSON.stringify(win, null, 2))
