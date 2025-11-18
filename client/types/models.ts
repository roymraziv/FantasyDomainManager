export interface Domain {
  id: number;
  name: string;
  ruler: string;
  population: number;
  upkeepCost?: number | null;
  upkeepCostLowerLimit?: number | null;
  upkeepCostUpperLimit?: number | null;
  income?: number | null;
  incomeLowerLimit?: number | null;
  incomeUpperLimit?: number | null;
  enterprises?: Enterprise[];
  heroes?: Hero[];
  troops?: Troop[];
}

export interface Hero {
  id: number;
  name: string;
  role: string;
  level: number;
  wage: number;
  domainId: number;
  domain?: Domain;
}

export interface Enterprise {
  id: number;
  name: string;
  income?: number | null;
  incomeLowerLimit?: number | null;
  incomeUpperLimit?: number | null;
  upkeepCost?: number | null;
  upkeepCostLowerLimit?: number | null;
  upkeepCostUpperLimit?: number | null;
  domainId: number;
  domain?: Domain;
}

export interface Troop {
  id: number;
  type: string;
  quantity: number;
  wage: number;
  domainId: number;
  domain?: Domain;
}

// DTOs for creating new objects (without id)
export type CreateDomainDto = Omit<Domain, 'id' | 'enterprises' | 'heroes' | 'troops'>;
export type CreateHeroDto = Omit<Hero, 'id' | 'domain'>;
export type CreateEnterpriseDto = Omit<Enterprise, 'id' | 'domain'>;
export type CreateTroopDto = Omit<Troop, 'id' | 'domain'>;

// DTOs for updating objects
export type UpdateDomainDto = Omit<Domain, 'enterprises' | 'heroes' | 'troops'>;
export type UpdateHeroDto = Hero;
export type UpdateEnterpriseDto = Enterprise;
export type UpdateTroopDto = Troop;
