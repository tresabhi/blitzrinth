import { memo, useEffect, useRef } from 'react';
import { Euler, Group, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { I_HAT, J_HAT, K_HAT } from '../../../constants/axis';
import {
  ModelTransformEventData,
  modelTransformEvent,
} from '../../../core/blitzkrieg/modelTransform';
import { nameToArmorId } from '../../../core/blitzkrieg/nameToArmorId';
import { resolveArmor } from '../../../core/blitzkrieg/resolveThickness';
import { useArmor } from '../../../hooks/useArmor';
import { useModel } from '../../../hooks/useModel';
import { useModelDefinitions } from '../../../hooks/useModelDefinitions';
import { useDuel } from '../../../stores/duel';
import { useTankopediaPersistent } from '../../../stores/tankopedia';
import { CoreArmor } from './CoreArmor';

interface CoreArmorSceneProps {
  ornamental?: boolean;
}

export const CoreArmorScene = memo<CoreArmorSceneProps>(
  ({ ornamental = false }) => {
    const protagonist = useDuel((state) => state.protagonist!);
    const wrapper = useRef<Group>(null);
    const modelDefinitions = useModelDefinitions();
    const turretContainer = useRef<Group>(null);
    const gunContainer = useRef<Group>(null);
    const initialTankopediaState = useTankopediaPersistent.getState();

    useEffect(() => {
      if (!modelDefinitions) return;

      const hullOrigin = new Vector3(
        trackModelDefinition.origin[0],
        trackModelDefinition.origin[1],
        -trackModelDefinition.origin[2],
      ).applyAxisAngle(I_HAT, Math.PI / 2);
      const turretOrigin = new Vector3(
        tankModelDefinition.turretOrigin[0],
        tankModelDefinition.turretOrigin[1],
        -tankModelDefinition.turretOrigin[2],
      ).applyAxisAngle(I_HAT, Math.PI / 2);
      const gunOrigin = new Vector3(
        turretModelDefinition.gunOrigin[0],
        turretModelDefinition.gunOrigin[1],
        -turretModelDefinition.gunOrigin[2],
      ).applyAxisAngle(I_HAT, Math.PI / 2);
      const turretPosition = new Vector3();
      const turretRotation = new Euler();
      const gunPosition = new Vector3();
      const gunRotation = new Euler();

      function handleModelTransform({ yaw, pitch }: ModelTransformEventData) {
        gunPosition
          .set(0, 0, 0)
          .sub(hullOrigin)
          .sub(turretOrigin)
          .sub(gunOrigin)
          .applyAxisAngle(I_HAT, pitch)
          .add(gunOrigin)
          .add(turretOrigin)
          .add(hullOrigin);
        gunRotation.set(pitch, 0, 0);
        gunContainer.current?.position.copy(gunPosition);
        gunContainer.current?.rotation.copy(gunRotation);

        if (yaw === undefined) return;

        turretPosition
          .set(0, 0, 0)
          .sub(hullOrigin)
          .sub(turretOrigin)
          .applyAxisAngle(new Vector3(0, 0, 1), yaw);
        turretRotation.set(0, 0, yaw);

        if (tankModelDefinition.turretRotation) {
          const initialPitch = -degToRad(
            tankModelDefinition.turretRotation.pitch,
          );
          const initialYaw = -degToRad(tankModelDefinition.turretRotation.yaw);
          const initialRoll = -degToRad(
            tankModelDefinition.turretRotation.roll,
          );

          turretPosition
            .applyAxisAngle(I_HAT, initialPitch)
            .applyAxisAngle(J_HAT, initialRoll)
            .applyAxisAngle(K_HAT, initialYaw);
          turretRotation.x += initialPitch;
          turretRotation.y += initialRoll;
          turretRotation.z += initialYaw;
        }

        turretPosition.add(turretOrigin).add(hullOrigin);
        turretContainer.current?.position.copy(turretPosition);
        turretContainer.current?.rotation.copy(turretRotation);
      }

      handleModelTransform(protagonist);
      modelTransformEvent.on(handleModelTransform);

      return () => {
        modelTransformEvent.off(handleModelTransform);
      };
    });

    useEffect(() => {
      const unsubscribe = useTankopediaPersistent.subscribe(
        (state) => state.mode,
        (mode) => {
          if (wrapper.current) wrapper.current.visible = mode === 'armor';
        },
      );

      return unsubscribe;
    });

    const armorGltf = useArmor(protagonist.tank.id);
    const { gltf: modelGltf } = useModel(protagonist.tank.id);

    const armorNodes = Object.values(armorGltf.nodes);
    const tankModelDefinition = modelDefinitions[protagonist.tank.id];
    const trackModelDefinition =
      tankModelDefinition.tracks[protagonist.track.id];
    const turretModelDefinition =
      tankModelDefinition.turrets[protagonist.turret.id];
    const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
    const hullOrigin = new Vector3(
      trackModelDefinition.origin[0],
      trackModelDefinition.origin[1],
      -trackModelDefinition.origin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);
    const turretOrigin = new Vector3(
      tankModelDefinition.turretOrigin[0],
      tankModelDefinition.turretOrigin[1],
      -tankModelDefinition.turretOrigin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);
    const gunOrigin = new Vector3(
      turretModelDefinition.gunOrigin[0],
      turretModelDefinition.gunOrigin[1],
      -turretModelDefinition.gunOrigin[2],
    ).applyAxisAngle(I_HAT, Math.PI / 2);

    return (
      <group
        ref={wrapper}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={initialTankopediaState.mode === 'armor'}
      >
        <group position={hullOrigin}>
          {armorNodes.map((node) => {
            const isHull = node.name.startsWith('hull_');
            const isVisible = isHull;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              tankModelDefinition.armor,
              armorId,
            );

            if (!isVisible || spaced || thickness === undefined) return null;

            return (
              <CoreArmor key={node.uuid} thickness={thickness} node={node} />
            );
          })}
        </group>

        <group ref={turretContainer}>
          <group position={hullOrigin}>
            {armorNodes.map((node) => {
              const isCurrentTurret = node.name.startsWith(
                `turret_${turretModelDefinition.model.toString().padStart(2, '0')}`,
              );
              const isVisible = isCurrentTurret;
              const armorId = nameToArmorId(node.name);
              const { spaced, thickness } = resolveArmor(
                turretModelDefinition.armor,
                armorId,
              );

              if (!isVisible || spaced || thickness === undefined) return null;

              return (
                <group key={node.uuid} position={turretOrigin}>
                  <CoreArmor
                    key={node.uuid}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              );
            })}
          </group>
          <group ref={gunContainer}>
            <group position={hullOrigin}>
              {armorNodes.map((node) => {
                const isCurrentGun = node.name.startsWith(
                  `gun_${gunModelDefinition.model.toString().padStart(2, '0')}`,
                );
                const isVisible = isCurrentGun;
                const armorId = nameToArmorId(node.name);
                const { spaced, thickness } = resolveArmor(
                  gunModelDefinition.armor,
                  armorId,
                );

                if (!isVisible || spaced || thickness === undefined)
                  return null;

                return (
                  <group
                    key={node.uuid}
                    position={turretOrigin.clone().add(gunOrigin)}
                  >
                    <CoreArmor thickness={thickness} node={node} />
                  </group>
                );
              })}
            </group>
          </group>
        </group>
      </group>
    );
  },
);
