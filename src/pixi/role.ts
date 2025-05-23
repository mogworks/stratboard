import { Icon } from './icon'

import enemy_level1 from '/assets/enemy/061707.png?url'
import boss from '/assets/enemy/061712.png?url'
import all from '/assets/role/all.png?url'
import any from '/assets/role/any.png?url'
import dps from '/assets/role/dps.png?url'
import healer from '/assets/role/healer.png?url'
import magic from '/assets/role/magic.png?url'
import melee from '/assets/role/melee.png?url'
import ranged from '/assets/role/ranged.png?url'
import tank from '/assets/role/tank.png?url'

export type RoleType = 'any' | 'all' | 'tank' | 'healer' | 'dps' | 'melee' | 'ranged' | 'magic' | 'boss' | 'enemy_level1'

export class Role extends Icon {
  role: RoleType
  tag: string = ''

  constructor(role: RoleType, tag: string = '') {
    super({ any, all, tank, healer, dps, melee, ranged, magic, boss, enemy_level1 }[role], tag)
    this.role = role
    this.tag = tag
  }
}
