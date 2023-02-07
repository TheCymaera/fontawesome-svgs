# FontAwesome SVGs
A tree-shakable library that exports [Font Awesome](https://fontawesome.com/) SVGs as strings. 

# Supported versions
- Font Awesome 5
- Font Awesome 6

# Usage
Icons are exported as `fa{version}_{iconSet}_{iconName}`. For example;
```ts
import { fa5_solid_bell } from 'fontawesome-svgs';

document.body.innerHTML = fa5_solid_bell;
```

# Building
The library is generated using a Deno script. 

To add your own icons, place them in the `icons` directory, then build using the following command:
```sh
npm run build
```

# License
Original license applies to Font Awesome icons.
https://fontawesome.com/v4/license/

The rest of the library is licensed under the MIT license.