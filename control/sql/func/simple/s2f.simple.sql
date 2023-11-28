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
                    ('${PREFIX}-sg-0'),
                    ('${PREFIX}-sg-1'),
                    ('${PREFIX}-sg-2'),
                    ('${PREFIX}-sg-3'),
                    ('${PREFIX}-sg-4'),
                    ('${PREFIX}-sg-5');
        
                INSERT INTO
                    sgroups.tbl_network(name, network, sg)
                VALUES
                    ('${PREFIX}-nw-0', '29.64.1.220/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-1', '29.64.1.221/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-2', '29.64.1.222/32', get_sg_id('${PREFIX}-sg-0')),
                    ('${PREFIX}-nw-3', '29.64.1.223/32', get_sg_id('${PREFIX}-sg-1')),
                    ('${PREFIX}-nw-4', '29.64.1.224/32', get_sg_id('${PREFIX}-sg-2')),
                    ('${PREFIX}-nw-5', '29.64.1.225/32', get_sg_id('${PREFIX}-sg-3')),
                    ('${PREFIX}-nw-6', '29.64.1.226/32', get_sg_id('${PREFIX}-sg-3')),
                    ('${PREFIX}-nw-7', '29.64.1.227/32', get_sg_id('${PREFIX}-sg-4')),
                    ('${PREFIX}-nw-8', '29.64.1.228/32', get_sg_id('${PREFIX}-sg-5')),
                    ('${PREFIX}-nw-9', '29.64.1.229/32', get_sg_id('${PREFIX}-sg-5'));
        
                INSERT INTO
                    sgroups.tbl_fqdn_rule (sg_from, fqdn_to, proto, ports, logs)
                VALUES
                    (
                        get_sg_id('${PREFIX}-sg-0'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-0.${TAIL}',
                        'udp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(54000, 54001))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    ),
                    (
                        get_sg_id('${PREFIX}-sg-1'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-1.${TAIL}',
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(54001, 54004))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    ),
                    (
                        get_sg_id('${PREFIX}-sg-2'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-2.${TAIL}',
                        'udp',
                        ARRAY[
                            ((int4multirange(int4range(NULL))), (int4multirange(int4range(54004,54005),int4range(54006,54007),int4range(54008,54011))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    ),
                    (
                        get_sg_id('${PREFIX}-sg-3'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-3.${TAIL}',
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(45000, 45001))), (int4multirange(int4range(55001, 55002)))),
                            ((int4multirange(int4range(45002, 45003))), (int4multirange(int4range(55003, 55006)))),
                            ((int4multirange(int4range(45006, 45007))), (int4multirange(int4range(55007, 55008),int4range(55009,55010),int4range(55011,55014))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    ),
                    (
                        get_sg_id('${PREFIX}-sg-4'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-4.${TAIL}',
                        'udp',
                        ARRAY[
                            ((int4multirange(int4range(46000, 46003))), (int4multirange(int4range(56003, 56004)))),
                            ((int4multirange(int4range(46004, 46007))), (int4multirange(int4range(56007, 56010)))),
                            ((int4multirange(int4range(46010, 46013))), (int4multirange(int4range(56013, 56014),int4range(56015,56016),int4range(56017,56020))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    ),
                    (
                        get_sg_id('${PREFIX}-sg-5'),
                        '${PREFIX}-p${PIPLINE_ID}-fqdn-5.${TAIL}',
                        'tcp',
                        ARRAY[
                            ((int4multirange(int4range(47000,47001),int4range(47002,47003),int4range(47004,47007))), (int4multirange(int4range(57005,57006)))),
                            ((int4multirange(int4range(47008,47009),int4range(47010,47011),int4range(47012,47015))), (int4multirange(int4range(57011,57014)))),
                            ((int4multirange(int4range(47016, 47021))), (int4multirange(int4range(57019,57024))))
                        ]::sgroups.sg_rule_ports[],
                        true
                    );
                    
                    INSERT INTO 
                        sgroups.tbl_sync_status(total_affected_rows)
                    VALUES
                        (1);
            COMMIT;
        END $$;