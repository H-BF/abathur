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
                    ('${PREFIX}-sg-base'),
                    ('${PREFIX}-sg-0'),
                    ('${PREFIX}-sg-1'),
                    ('${PREFIX}-sg-2'),
                    ('${PREFIX}-sg-3');

                INSERT INTO
                    sgroups.tbl_network(sg, name, network)
                VALUES
                    (get_sg_id('${PREFIX}-sg-base'), '${PREFIX}-nw-sg-base', '29.64.3.220'),
                    (get_sg_id('${PREFIX}-sg-0'), '${PREFIX}-nw-0', '29.64.3.221'),
                    (get_sg_id('${PREFIX}-sg-1'), '${PREFIX}-nw-1', '29.64.3.222'),
                    (get_sg_id('${PREFIX}-sg-2'), '${PREFIX}-nw-2', '29.64.3.223'),
                    (get_sg_id('${PREFIX}-sg-3'), '${PREFIX}-nw-3', '29.64.3.224');

                INSERT INTO
                    sgroups.tbl_sg_icmp_rule(ip_v, types, sg, logs, trace)
                VALUES
                    ('IPv4', '{}'::sgroups.icmp_types, get_sg_id('${PREFIX}-sg-base'), true, true),
                    ('IPv4', '{8}'::sgroups.icmp_types, get_sg_id('${PREFIX}-sg-0'), true, true),
                    ('IPv4', '{}'::sgroups.icmp_types, get_sg_id('${PREFIX}-sg-1'), true, true);

                INSERT INTO
                    sgroups.tbl_sg_sg_icmp_rule(ip_v, types, sg_from, sg_to, logs, trace)
                VALUES
                    ('IPv4', '{}'::sgroups.icmp_types, get_sg_id('${PREFIX}-sg-2'), get_sg_id('${PREFIX}-sg-3'), true, true),
                    ('IPv4', '{8}'::sgroups.icmp_types, get_sg_id('${PREFIX}-sg-3'), get_sg_id('${PREFIX}-sg-2'), true, true);

                INSERT INTO
                    sgroups.tbl_sync_status(total_affected_rows)
                VALUES
                    (1);
            COMMIT;
        END $$