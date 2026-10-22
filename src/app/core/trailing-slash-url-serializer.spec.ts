import { TrailingSlashUrlSerializer } from './trailing-slash-url-serializer';

describe('TrailingSlashUrlSerializer', () => {
  const s = new TrailingSlashUrlSerializer();
  const roundtrip = (url: string) => s.serialize(s.parse(url));

  it('hängt an Pfade einen Slash an', () => {
    expect(roundtrip('/hochzeit')).toBe('/hochzeit/');
    expect(roundtrip('/hochzeit/')).toBe('/hochzeit/');
    expect(roundtrip('/ueber_mich')).toBe('/ueber_mich/');
  });

  it('lässt die Startseite unverändert', () => {
    expect(roundtrip('/')).toBe('/');
  });

  it('setzt den Slash vor Fragment und Query', () => {
    expect(roundtrip('/hochzeit#kontakt')).toBe('/hochzeit/#kontakt');
    expect(roundtrip('/kontakt?x=1')).toBe('/kontakt/?x=1');
  });
});
