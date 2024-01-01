import { useThree } from '@react-three/fiber';
import { RefObject, useEffect } from 'react';
import { Box3, Group } from 'three';

interface TankAlignmentProps {
  model: RefObject<Group>;
}

export function TankAlignment({ model }: TankAlignmentProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const box = new Box3().setFromObject(model.current!);
    const diameter = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    const radius = diameter / 2;

    model.current?.position.set(0, -(box.min.y + box.max.y) / 2, 0);
    // camera.position.set(radius * -0.25, radius * 0.1, radius * -1.5);
  }, []);

  return null;
}