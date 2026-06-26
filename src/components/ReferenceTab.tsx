import { getMaterials } from '../engine/stress';

export function ReferenceTab() {
  const materials = getMaterials('asme-2015');

  return (
    <div className="ref-body">
      <section className="ref-section">
        <h2>PG-27.2.1 — Minimum Wall Thickness</h2>
        <pre className="ref-formula">{'t = PD / (2Sw + P) + 0.005D + e'}</pre>
        <table className="ref-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>t</td>
              <td>Minimum required wall thickness (in or mm)</td>
            </tr>
            <tr>
              <td>P</td>
              <td>Design gauge pressure (psi or MPa)</td>
            </tr>
            <tr>
              <td>D</td>
              <td>Outside diameter (in or mm)</td>
            </tr>
            <tr>
              <td>S</td>
              <td>
                Allowable stress at design temperature (psi or MPa), from Table 1A of Section II-D
              </td>
            </tr>
            <tr>
              <td>w</td>
              <td>Ligament or weld joint efficiency (dimensionless, ≤ 1)</td>
            </tr>
            <tr>
              <td>e</td>
              <td>
                Thickness addition for expanded tube ends: 0.04 in (US) or 1.0 mm (SI) per
                PG-27.4.4; 0 otherwise
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="ref-section">
        <h2>Torus Bend Check</h2>
        <pre className="ref-formula">{'r = (D − 2t) / 2\nY = t × (R + r/2) / (R + r)'}</pre>
        <table className="ref-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>D</td>
              <td>Outside diameter (in or mm)</td>
            </tr>
            <tr>
              <td>t</td>
              <td>Straight-tube minimum wall from PG-27.2.1</td>
            </tr>
            <tr>
              <td>R</td>
              <td>Bend radius to tube centerline (in or mm)</td>
            </tr>
            <tr>
              <td>r</td>
              <td>Inside bore radius (in or mm)</td>
            </tr>
            <tr>
              <td>Y</td>
              <td>Minimum wall required on the outside of the bend (in or mm)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="ref-section">
        <h2>Edition Notes</h2>
        <table className="ref-table">
          <thead>
            <tr>
              <th>Edition</th>
              <th>Design factor</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ASME 2015 (post-1999)</td>
              <td>3.5 : 1</td>
              <td>Current code. Allows higher allowable stresses for the same material.</td>
            </tr>
            <tr>
              <td>Pre-1999</td>
              <td>4.0 : 1</td>
              <td>
                Conservative factor retained for code-stamped repairs or jurisdictional requirement.
              </td>
            </tr>
          </tbody>
        </table>
        <p className="ref-note">
          The 1999 ASME Code Cases reduced the design factor for carbon and low-alloy steel from 4:1
          to 3.5:1, raising tabulated allowable stresses proportionally. Materials qualified after
          1999 appear only in post-1999 editions. Use pre-1999 tables when required by the
          jurisdiction or the repair specification.
        </p>
      </section>

      <section className="ref-section">
        <h2>Materials — ASME 2015 (Table 1A)</h2>
        <table className="ref-table">
          <thead>
            <tr>
              <th>Spec</th>
              <th>Grade</th>
              <th>Product Form</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td>{m.spec}</td>
                <td>{m.grade}</td>
                <td>{m.productForm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ref-section">
        <h2>Practical Notes</h2>
        <ul className="ref-notes-list">
          <li>
            Wall thicknesses below 0.125 in (3.2 mm) are not reliably produced to tolerance by most
            tube mills. Confirm minimum wall capability with the manufacturer before ordering.
          </li>
          <li>
            The 0.005D and 0.01D terms in PG-27.2.1 account for tube-mill tolerance on wall
            thickness; they are fixed by the code and are not adjustable.
          </li>
          <li>
            This calculator assumes full joint efficiency unless w is set otherwise. Refer to
            PG-27.4.5 for ligamented drum calculations.
          </li>
          <li>
            The torus bend check is supplementary and is not required by PG-27.2.1. Use it to verify
            bend section adequacy after the straight-tube minimum is established.
          </li>
        </ul>
      </section>
    </div>
  );
}
