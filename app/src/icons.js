// Lucide icons bundled locally (the prototype loaded them from jsDelivr). Rendered as CSS masks.
import i_backpack from 'lucide-static/icons/backpack.svg?url';
import i_car from 'lucide-static/icons/car.svg?url';
import i_chevron_down from 'lucide-static/icons/chevron-down.svg?url';
import i_chevron_right from 'lucide-static/icons/chevron-right.svg?url';
import i_chevron_up from 'lucide-static/icons/chevron-up.svg?url';
import i_cloud_off from 'lucide-static/icons/cloud-off.svg?url';
import i_database from 'lucide-static/icons/database.svg?url';
import i_external_link from 'lucide-static/icons/external-link.svg?url';
import i_hand from 'lucide-static/icons/hand.svg?url';
import i_mountain_snow from 'lucide-static/icons/mountain-snow.svg?url';
import i_picture_in_picture_2 from 'lucide-static/icons/picture-in-picture-2.svg?url';
import i_refresh_cw from 'lucide-static/icons/refresh-cw.svg?url';
import i_repeat from 'lucide-static/icons/repeat.svg?url';
import i_settings_2 from 'lucide-static/icons/settings-2.svg?url';
import i_snowflake from 'lucide-static/icons/snowflake.svg?url';
import i_waves from 'lucide-static/icons/waves.svg?url';
import i_x from 'lucide-static/icons/x.svg?url';
import i_thermometer from 'lucide-static/icons/thermometer.svg?url';
import i_share from 'lucide-static/icons/share.svg?url';
import i_square_plus from 'lucide-static/icons/square-plus.svg?url';
import i_ellipsis_vertical from 'lucide-static/icons/ellipsis-vertical.svg?url';
import i_route from 'lucide-static/icons/route.svg?url';
import i_columns_2 from 'lucide-static/icons/columns-2.svg?url';
import i_wind from 'lucide-static/icons/wind.svg?url';
import i_trending_up from 'lucide-static/icons/trending-up.svg?url';
import i_trending_down from 'lucide-static/icons/trending-down.svg?url';
import i_arrow_up_right from 'lucide-static/icons/arrow-up-right.svg?url';

const ICONS = {
  'backpack': i_backpack,
  'car': i_car,
  'chevron-down': i_chevron_down,
  'chevron-right': i_chevron_right,
  'chevron-up': i_chevron_up,
  'cloud-off': i_cloud_off,
  'database': i_database,
  'external-link': i_external_link,
  'hand': i_hand,
  'mountain-snow': i_mountain_snow,
  'picture-in-picture-2': i_picture_in_picture_2,
  'refresh-cw': i_refresh_cw,
  'repeat': i_repeat,
  'settings-2': i_settings_2,
  'snowflake': i_snowflake,
  'waves': i_waves,
  'x': i_x,
  'share': i_share,
  'thermometer': i_thermometer,
  'square-plus': i_square_plus,
  'ellipsis-vertical': i_ellipsis_vertical,
  'route': i_route,
  'columns-2': i_columns_2,
  'wind': i_wind,
  'trending-up': i_trending_up,
  'trending-down': i_trending_down,
  'arrow-up-right': i_arrow_up_right,
};

export const iconUrl = n => ICONS[n] || '';
