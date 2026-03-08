
CREATE OR REPLACE FUNCTION public.get_booking_details_by_reference(ref_code text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result json;
  booking_row bookings%ROWTYPE;
BEGIN
  SELECT * INTO booking_row FROM public.bookings WHERE reference_code = ref_code;

  IF NOT FOUND THEN
    RETURN json_build_object('found', false);
  END IF;

  SELECT json_build_object(
    'found', true,
    'booking', row_to_json(booking_row),
    'tents', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM public.booking_tents t
      WHERE t.booking_id = booking_row.id
    ), '[]'::json),
    'addons', COALESCE((
      SELECT json_agg(row_to_json(a))
      FROM public.booking_addons a
      WHERE a.booking_id = booking_row.id
    ), '[]'::json),
    'guest_info', (
      SELECT row_to_json(g)
      FROM public.guest_info g
      WHERE g.booking_id = booking_row.id
      LIMIT 1
    )
  ) INTO result;

  RETURN result;
END;
$function$;
