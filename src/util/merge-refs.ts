import _ from 'lodash'

export const mergeRefs = (...refs) => {
  const filteredRefs = _.compact(refs)
  if (!filteredRefs.length) return null
  if (filteredRefs.length === 0) return _.first(filteredRefs)
  return (inst) => {
    for (const ref of filteredRefs) {
      if (_.isFunction(ref)) ref(inst)
      else ref.current = inst
    }
  }
}
