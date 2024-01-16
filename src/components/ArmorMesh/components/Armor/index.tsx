import { MeshProps, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { MeshStandardMaterial, ShaderMaterial, Vector2 } from 'three';
import ThreeCustomShaderMaterial from 'three-custom-shader-material';
import { degToRad } from 'three/src/math/MathUtils';
import { Duel } from '../../../../app/tools/tankopedia/[id]/page';
import { canSplash } from '../../../../core/blitz/canSplash';
import { isExplosive } from '../../../../core/blitz/isExplosive';
import { resolveNearPenetration } from '../../../../core/blitz/resolveNearPenetration';
import { externalModuleMaskRenderTarget } from '../ExternalModuleMask';
import { spacedArmorDepthRenderTarget } from '../SpacedArmorDepth';
import fragmentShader from './shaders/fragment.glsl';
import vertexShader from './shaders/vertex.glsl';

interface ArmorMeshProps extends MeshProps {
  duel: Duel;
  isSpaced: boolean;
  isExternalModule?: boolean;
  thickness: number;
}

export function ArmorMesh({
  isSpaced,
  isExternalModule = false,
  thickness,
  duel,
  ...props
}: ArmorMeshProps) {
  const camera = useThree((state) => state.camera);
  const { shell } = duel.antagonist;
  const material = useRef<ShaderMaterial>(null);
  const resolution = new Vector2();

  useFrame(({ gl, camera }) => {
    if (material.current) {
      material.current.uniforms.resolution.value = resolution.set(
        gl.domElement.width,
        gl.domElement.height,
      );
      material.current.uniforms.externalModuleMask.value =
        externalModuleMaskRenderTarget.texture;
      material.current.uniforms.spacedArmorDepth.value =
        spacedArmorDepthRenderTarget.depthTexture;
      material.current.uniforms.projectionMatrixInverse.value =
        camera.projectionMatrixInverse;
    }
  });

  return (
    <>
      <mesh {...props} renderOrder={0}>
        <meshBasicMaterial colorWrite={false} />
      </mesh>

      <mesh {...props} renderOrder={1}>
        <ThreeCustomShaderMaterial
          ref={material}
          silent
          baseMaterial={MeshStandardMaterial}
          transparent
          depthWrite={false}
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={{
            resolution: { value: null },
            externalModuleMask: { value: null },
            spacedArmorDepth: { value: null },
            projectionMatrixInverse: { value: null },
            zNear: { value: camera.near },
            zFar: { value: camera.far },
            isSpaced: { value: isSpaced },
            isExplosive: { value: isExplosive(shell.type) },
            canSplash: { value: canSplash(shell.type) },
            isExternalModule: { value: isExternalModule },
            thickness: { value: thickness },
            penetration: {
              value: resolveNearPenetration(shell.penetration),
            },
            caliber: { value: shell.caliber },
            ricochet: { value: degToRad(shell.ricochet ?? 90) },
            normalization: {
              value: degToRad(shell.normalization ?? 0),
            },
          }}
        />
      </mesh>
    </>
  );
}