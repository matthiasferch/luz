MaterialSample evaluateMaterial(MaterialContext context) {
  MaterialSample materialSample;

  materialSample.baseColor = vec3(0.8);
  materialSample.alpha = 1.0;
  materialSample.tangentNormal = vec3(0.0, 0.0, 1.0);
  materialSample.metallic = 0.0;
  materialSample.roughness = 0.5;
  materialSample.occlusion = 1.0;
  materialSample.emission = vec3(0.0);
  materialSample.transmission = 0.0;
  materialSample.indexOfRefraction = 1.45;
  materialSample.specularLevel = 0.5;
  materialSample.transmissionDepth = materialTransmissionDepth;
  materialSample.subsurfaceWeight = 0.0;
  materialSample.subsurfaceScale = 0.01;
  materialSample.absorptionColor = vec3(1.0);
  materialSample.absorptionDensity = 0.0;
  materialSample.principledWeight = 1.0;
  materialSample.glossyCount = 0;

  for (int index = 0; index < 4; ++index) {
    materialSample.glossy[index].color = vec3(0.0);
    materialSample.glossy[index].roughness = 0.5;
    materialSample.glossy[index].tangentNormal = vec3(0.0, 0.0, 1.0);
    materialSample.glossy[index].weight = 0.0;
  }

  return materialSample;
}