        CREATE OR REPLACE FUNCTION get_sg_id(sg_name varchar) RETURNS integer AS $$
            BEGIN
                    RETURN (SELECT id FROM sgroups.tbl_sg WHERE name = sg_name);
            END
        $$ LANGUAGE plpgsql;

        DO $$
            BEGIN
                INSERT INTO
                    sgroups.tbl_sg(name)
                VALUES
                    ('${PREFIX}-sg-0');

                INSERT INTO
                    sgroups.tbl_network(name, network, sg)
                VALUES
                    ('${PREFIX}-nw-0', '29.64.3.220/32', get_sg_id('${PREFIX}-sg-0'));

                INSERT INTO
                    sgroups.tbl_fqdn_rule (sg_from, fqdn_to, proto, ports, logs)
                VALUES
                    (
                        get_sg_id('${PREFIX}-sg-0'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-0.${TAIL}',
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(54000, 54001))), (int4multirange(int4range(54000, 54001))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    );

                INSERT INTO 
                    sgroups.tbl_sync_status(total_affected_rows)
                VALUES
                    (1);                             
            COMMIT;
        END $$