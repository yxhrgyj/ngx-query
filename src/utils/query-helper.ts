import { Field, QueryGroup, Rule } from '../query.types';

export function translateQueryGroup(queryGroup: QueryGroup, fields: Array<Field>): void {

  if (queryGroup.rules != null) {
    for (const rule of queryGroup.rules) {

      if (rule.datas === undefined) {
        rule.datas = [undefined, undefined];
        if (rule.data) {
          rule.datas[0] = rule.data;
        }
      }

      if (rule.datas) {
        rule['sdatas'] = rule.datas;
      }

      // if (rule.data) {
      //   rule['sdata'] = rule.data;
      // } else {
      //   rule.data = rule.datas[0]
      // }

      if (typeof rule.field === 'string') {
        var field: any = fields.find(x => x.name === rule.field);

        if (field === undefined || field === null) {
          throw new Error(`Can't found out a field by name '${rule.field}'.`);
        }

        rule.field = field;
      }
    }
  }

  if (queryGroup.groups && queryGroup.groups !== null) {
    for (const group of queryGroup.groups) {
      translateQueryGroup(group, fields);
    }
  }
}

export function cloneQueryGroup(source: QueryGroup): QueryGroup {
  var result: QueryGroup = {
    op: source.op,
    groups: [],
    rules: []
  };

  if (source.rules && source.rules.length > 0) {
    for (const rule of source.rules) {
      result.rules.push({
        field: rule.field,
        op: rule.op,
        data: rule.data,
        datas: rule.datas ? rule.datas.map(x => x) : undefined
      });
    }
  }

  if (source.groups && source.groups.length > 0) {
    for (const child of source.groups) {
      result.groups.push(cloneQueryGroup(child));
    }
  }

  return result;
}

export function generateQuery(queryGroup: QueryGroup): QueryGroup {
  if (queryGroup === undefined || queryGroup === null) {
    return undefined;
  }

  var result: QueryGroup = {
    op: queryGroup.op,
    groups: [],
    rules: []
  };

  if (queryGroup.rules && queryGroup.rules.length > 0) {
    for (const rule of queryGroup.rules) {
      var rule2: Rule = {
        field: rule.field['name'],
        op: rule.op,
        data: undefined,
        datas: undefined
      };

      if (rule.datas)
        if (rule2.op === 'bt') {
          rule2.datas = rule.datas;
        } else {
          rule2.data = rule.datas[0];
        }

      result.rules.push(rule2);
    }
  }

  if (queryGroup.groups && queryGroup.groups.length > 0) {
    for (const child of queryGroup.groups) {
      result.groups.push(generateQuery(child));
    }
  }

  return result;
}