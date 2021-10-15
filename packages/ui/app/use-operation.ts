import { Operation } from 'effection';
import { EffectionContext } from '@effection/react';
import { useContext, useEffect } from 'react';

export function useOperation(operation: Operation<void>, deps?: React.DependencyList): void {
  let scope = useContext(EffectionContext);
  useEffect(() => {
    let task = scope.run(operation);
    return () => { task.halt() };
  }, [operation, scope].concat(deps));
}
