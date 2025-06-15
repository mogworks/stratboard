import type { CombinedRoleType, RoleType } from '@/lib/role'

import { CombinedIcon, Icon } from './icon'

import enemy_level1 from '/assets/enemy/061707.png?url'
import boss from '/assets/enemy/061712.png?url'
import all from '/assets/role/all.png?url'
import any from '/assets/role/any.png?url'
import dps from '/assets/role/dps.png?url'
import healer from '/assets/role/healer.png?url'
import magic from '/assets/role/magic.png?url'
import melee from '/assets/role/melee.png?url'
import ranged_magic from '/assets/role/ranged_magic.png?url'
import ranged from '/assets/role/ranged.png?url'
import tank from '/assets/role/tank.png?url'

const roleImgMap = {
  any,
  all,
  tank,
  healer,
  dps,
  melee,
  ranged,
  magic,
  ranged_magic,
  boss,
  enemy_level1,
}

export class Role extends Icon {
  role: RoleType
  tag: string = ''

  constructor(role: RoleType, tag: string = '') {
    super(roleImgMap[role], tag)
    this.role = role
    this.tag = tag
  }
}

export class CombinedRole extends CombinedIcon {
  role: CombinedRoleType
  tag: string = ''

  constructor(role1: 'tank' | 'healer' | 'dps', role2: 'tank' | 'healer' | 'dps', tag: string = '') {
    super(roleImgMap[role1], roleImgMap[role2], tag)
    this.role = `${role1}|${role2}` as CombinedRoleType
    this.tag = tag
  }
}

export const createRoleIcon = (role: RoleType | CombinedRoleType, tag: string = '') => {
  if (role.includes('|')) {
    const [role1, role2] = role.split('|')
    return new CombinedRole(role1 as 'tank' | 'healer' | 'dps', role2 as 'tank' | 'healer' | 'dps', tag)
  } else {
    return new Role(role as RoleType, tag)
  }
}
